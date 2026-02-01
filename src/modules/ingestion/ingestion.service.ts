import { Injectable, Logger } from '@nestjs/common';
import { pool } from '../../db/pool';
import { CreateMeterDto } from './dto/create-meter.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  // --------------------------
  // 1. Bulk insert meters
  // --------------------------
  async ingestMetersBulk(dtos: CreateMeterDto[]) {
    if (!dtos.length) return;

    const values: any[] = [];
    const params: string[] = [];

    dtos.forEach((dto, i) => {
      const idx = i * 4;
      values.push(dto.meterId, dto.kwhConsumedAc, dto.voltage, new Date(dto.timestamp));
      params.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
    });

    // Insert into history (TimescaleDB hypertable)
    const queryHistory = `
      INSERT INTO meter_history (meter_id, kwh_consumed_ac, voltage, ts)
      VALUES ${params.join(',')}
      ON CONFLICT DO NOTHING
    `;
    await pool.query(queryHistory, values);

    // Upsert into live table
    const liveInserts = dtos.map(dto => `
      INSERT INTO meter_live (meter_id, kwh_consumed_ac, voltage, ts)
      VALUES ('${dto.meterId}', ${dto.kwhConsumedAc}, ${dto.voltage}, '${dto.timestamp}')
      ON CONFLICT (meter_id) DO UPDATE
        SET kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
            voltage = EXCLUDED.voltage,
            ts = EXCLUDED.ts
    `);
    await pool.query(liveInserts.join(';'));

    this.logger.log(`Inserted ${dtos.length} meter records in bulk`);
    return { inserted: dtos.length, success: true, message: 'Meters ingested successfully' };
  }

  // --------------------------
  // 2. Bulk insert vehicles
  // --------------------------
  async ingestVehiclesBulk(dtos: CreateVehicleDto[]) {
    if (!dtos.length) return;

    const values: any[] = [];
    const params: string[] = [];

    dtos.forEach((dto, i) => {
      const idx = i * 5;
      values.push(dto.vehicleId, dto.soc, dto.kwhDeliveredDc, dto.batteryTemp, new Date(dto.timestamp));
      params.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`);
    });

    // Insert into history (TimescaleDB hypertable)
    const queryHistory = `
      INSERT INTO vehicle_history (vehicle_id, soc, kwh_delivered_dc, battery_temp, ts)
      VALUES ${params.join(',')}
      ON CONFLICT DO NOTHING
    `;
    await pool.query(queryHistory, values);

    // Upsert into live table
    const liveInserts = dtos.map(dto => `
      INSERT INTO vehicle_live (vehicle_id, soc, kwh_delivered_dc, battery_temp, ts)
      VALUES ('${dto.vehicleId}', ${dto.soc}, ${dto.kwhDeliveredDc}, ${dto.batteryTemp}, '${dto.timestamp}')
      ON CONFLICT (vehicle_id) DO UPDATE
        SET soc = EXCLUDED.soc,
            kwh_delivered_dc = EXCLUDED.kwh_delivered_dc,
            battery_temp = EXCLUDED.battery_temp,
            ts = EXCLUDED.ts
    `);
    await pool.query(liveInserts.join(';'));

    this.logger.log(`Inserted ${dtos.length} vehicle records in bulk`);
    return { inserted: dtos.length, success: true, message: 'Vehicles ingested successfully' };
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var IngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const pool_1 = require("../../db/pool");
let IngestionService = IngestionService_1 = class IngestionService {
    constructor() {
        this.logger = new common_1.Logger(IngestionService_1.name);
    }
    // --------------------------
    // 1. Bulk insert meters
    // --------------------------
    async ingestMetersBulk(dtos) {
        if (!dtos.length)
            return;
        const values = [];
        const params = [];
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
        await pool_1.pool.query(queryHistory, values);
        // Upsert into live table
        const liveInserts = dtos.map(dto => `
      INSERT INTO meter_live (meter_id, kwh_consumed_ac, voltage, ts)
      VALUES ('${dto.meterId}', ${dto.kwhConsumedAc}, ${dto.voltage}, '${dto.timestamp}')
      ON CONFLICT (meter_id) DO UPDATE
        SET kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
            voltage = EXCLUDED.voltage,
            ts = EXCLUDED.ts
    `);
        await pool_1.pool.query(liveInserts.join(';'));
        this.logger.log(`Inserted ${dtos.length} meter records in bulk`);
        return { inserted: dtos.length, success: true, message: 'Meters ingested successfully' };
    }
    // --------------------------
    // 2. Bulk insert vehicles
    // --------------------------
    async ingestVehiclesBulk(dtos) {
        if (!dtos.length)
            return;
        const values = [];
        const params = [];
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
        await pool_1.pool.query(queryHistory, values);
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
        await pool_1.pool.query(liveInserts.join(';'));
        this.logger.log(`Inserted ${dtos.length} vehicle records in bulk`);
        return { inserted: dtos.length, success: true, message: 'Vehicles ingested successfully' };
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = IngestionService_1 = __decorate([
    (0, common_1.Injectable)()
], IngestionService);

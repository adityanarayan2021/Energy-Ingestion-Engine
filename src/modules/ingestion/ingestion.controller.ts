import { Body, Controller, Post } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('v1/ingest')
export class IngestionController {
  constructor(private readonly service: IngestionService) {}

  @Post('meters')
  bulkMeters(@Body() dtos: CreateMeterDto[]) {
    return this.service.ingestMetersBulk(dtos);
  }

  @Post('vehicles')
  bulkVehicles(@Body() dtos: CreateVehicleDto[]) {
    return this.service.ingestVehiclesBulk(dtos);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('performance/:vehicleId')
  async performance(@Param('vehicleId') vehicleId: string) {
    if(!vehicleId) {
      throw new Error('vehicleId parameter is required');
    }
    return this.service.performance(vehicleId);
  }
}

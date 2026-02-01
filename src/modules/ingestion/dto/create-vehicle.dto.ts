import { IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  soc: number; // State of Charge %

  @IsNumber()
  kwhDeliveredDc: number;

  @IsNumber()
  batteryTemp: number;

  @IsDateString()
  timestamp: string;
}

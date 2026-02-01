import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateMeterDto {
  @IsString()
  meterId: string;

  @IsNumber()
  kwhConsumedAc: number;

  @IsNumber()
  voltage: number;

  @IsDateString()
  timestamp: string;
}

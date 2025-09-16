import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDayDto {
  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsString()
  location: string;

  @IsString()
  subject: string;
}

export class createScheduleDto {
  @ValidateNested()
  @Type(() => ScheduleDayDto)
  monday?: ScheduleDayDto;

  @ValidateNested()
  @Type(() => ScheduleDayDto)
  tuesday?: ScheduleDayDto;

  @ValidateNested()
  @Type(() => ScheduleDayDto)
  wednesday?: ScheduleDayDto;

  @ValidateNested()
  @Type(() => ScheduleDayDto)
  thursday?: ScheduleDayDto;

  @ValidateNested()
  @Type(() => ScheduleDayDto)
  friday?: ScheduleDayDto;
}

export class updateScheduleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDayDto)
  monday?: ScheduleDayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDayDto)
  tuesday?: ScheduleDayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDayDto)
  wednesday?: ScheduleDayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDayDto)
  thursday?: ScheduleDayDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDayDto)
  friday?: ScheduleDayDto;
}
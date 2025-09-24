import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleSubjectDto {
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
  @Type(() => ScheduleSubjectDto)
  monday?: ScheduleSubjectDto[];

  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  tuesday?: ScheduleSubjectDto[];

  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  wednesday?: ScheduleSubjectDto[];

  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  thursday?: ScheduleSubjectDto[];

  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  friday?: ScheduleSubjectDto[];
}

export class updateScheduleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  monday?: ScheduleSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  tuesday?: ScheduleSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  wednesday?: ScheduleSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  thursday?: ScheduleSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleSubjectDto)
  friday?: ScheduleSubjectDto[];
}
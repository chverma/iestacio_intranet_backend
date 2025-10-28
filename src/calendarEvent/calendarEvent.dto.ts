import { IsString, ValidateNested, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class createEventDto {
  @IsString()
  subject: string;

  @IsString()
  email: string;

  @IsString()
  body: string;

  @IsDate()
  start: Date;

  @IsDate()
  end: Date;

  @IsString()
  outlook_event_id: string;
}

export class updateEventDto {
  @IsOptional()
  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  body: string;

  @IsOptional()
  @IsDate()
  start: Date;

  @IsOptional()
  @IsDate()
  end: Date;

  @IsOptional()
  @IsString()
  outlook_event_id: string;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;
}
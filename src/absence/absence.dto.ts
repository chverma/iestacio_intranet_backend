import { IsString, ValidateNested, IsOptional, IsDate, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AbsenceSubjectDto {
  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsDate()
  date_absence: Date;

  @IsString()
  location: string;

  @IsString()
  subject: string;

  @IsString()
  group: string;

  @IsString()
  work: string;

  @IsInt()
  id_user: number;
}


export class createAbsenceDto {
  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsDate()
  date_absence: Date;

  @IsString()
  location: string;

  @IsString()
  subject: string;

  @IsString()
  group: string;

  @IsString()
  work: string;

  @IsInt()
  id_user: number;

}

export class updateAbsenceDto {
  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsDate()
  date_absence: Date;

  @IsString()
  location: string;

  @IsString()
  subject: string;

  @IsString()
  group: string;

  @IsString()
  work: string;

  @IsInt()
  id_user: number;
}
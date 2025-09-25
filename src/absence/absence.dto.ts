import { IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AbsenceSubjectDto {
  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsString()
  location: string;

  @IsString()
  subject: string;
}


export class createAbsenceDto {
  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  monday?: AbsenceSubjectDto[];

  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  tuesday?: AbsenceSubjectDto[];

  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  wednesday?: AbsenceSubjectDto[];

  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  thursday?: AbsenceSubjectDto[];

  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  friday?: AbsenceSubjectDto[];
}

export class updateAbsenceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  monday?: AbsenceSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  tuesday?: AbsenceSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  wednesday?: AbsenceSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  thursday?: AbsenceSubjectDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AbsenceSubjectDto)
  friday?: AbsenceSubjectDto[];
}
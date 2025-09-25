import { Module } from '@nestjs/common';
import { AbsenceController } from './absence.controller';
import { AbsenceService } from './absence.service';
import { Absence } from './absence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Absence])],
  exports: [TypeOrmModule],
  controllers: [AbsenceController],
  providers: [AbsenceService],
})
export class AbsenceModule {}

import { Module } from '@nestjs/common';
import { CalendarEventController } from './calendarEvent.controller';
import { CalendarEventService } from './calendarEvent.service';
import { CalendarEvent } from './calendarEvent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Schedule } from 'src/schedule/schedule.entity';
import { AbsenceModule } from 'src/absence/absence.module';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent, User, Schedule]), AbsenceModule],
  exports: [TypeOrmModule],
  controllers: [CalendarEventController],
  providers: [CalendarEventService],
})
export class CalendarEventModule {}

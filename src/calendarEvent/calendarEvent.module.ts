import { Module } from '@nestjs/common';
import { CalendarEventController } from './calendarEvent.controller';
import { CalendarEventService } from './calendarEvent.service';
import { CalendarEvent } from './calendarEvent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent, User])],
  exports: [TypeOrmModule],
  controllers: [CalendarEventController],
  providers: [CalendarEventService],
})
export class CalendarEventModule {}

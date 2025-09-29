import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from './calendarEvent.entity';
import { createEventDto, updateEventDto } from './calendarEvent.dto';
import { User } from '../users/users.entity';

@Injectable()
export class CalendarEventService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepository: Repository<CalendarEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllEvent(): Promise<CalendarEvent[]> {
    return this.eventRepository.find({ relations: ['user'] });
  }

  async getEvent(id: number): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({ where: { id_event: id }, relations: ['user'] });
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    return event;
  }

  async getEventByUserId(userId: number): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({ where: { user: { id_user: userId } }, relations: ['user'] });
    if (!event) {
      throw new HttpException('No event found for user', HttpStatus.NOT_FOUND);
    }
    return event;
  }

  async getCalendarEventByUserId(userId: number, res): Promise<CalendarEvent> {
    const event = await this.getEventByUserId(userId);
    return event;
  }

  async createEvent(eventDto: createEventDto): Promise<CalendarEvent> {
    const event = this.eventRepository.create(eventDto);
    event.body = await this.parseHTMLBody(eventDto.body);
    event.user = await this.userRepository.findOne({ where: { email: eventDto.email } });
    const saved = await this.eventRepository.save(event);
    return saved;
  }

  async updateEvent(id: number, eventDto: updateEventDto): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({ where: { id_event: id } });
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(event, eventDto);
    return this.eventRepository.save(event);
  }

  async deleteEvent(id: number): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
  }

  async parseHTMLBody(htmlBody: string): Promise<string> {
    // Simple parsing logic (can be enhanced as needed)
    return htmlBody.replace(/<[^>]+>/g, '').replace(/[\r\n]/g, '') ;
  }
}

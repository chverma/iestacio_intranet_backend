import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CalendarEvent } from './calendarEvent.entity';
import { createEventDto, updateEventDto } from './calendarEvent.dto';
import { User } from '../users/users.entity';
import { Cron } from '@nestjs/schedule';
import { Schedule } from '../schedule/schedule.entity';
import { Absence } from '../absence/absence.entity';

@Injectable()
export class CalendarEventService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepository: Repository<CalendarEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,
  ) { }

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
    return htmlBody.replace(/<[^>]+>/g, '').replace(/[\r\n]/g, '');
  }

  dayOfWeek: Array<string> = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']; // Sunday to Saturday
  subjectHours = { '08': '05', '09': '00', '10': '50', '11': '15', '12': '10', '13': '05', '14': '00', '15': '10', '16': '05', '17': '00', '18': '15', '19': '10', '20': '05', '21': '10' };
  @Cron('*/15 * * * * *')
  async handleCron() {
    const events = await this.eventRepository.find({ where: { processed: false }, relations: ['user'] });
    events.forEach(async event => {

      console.log('Processing event:', event.id_event, event.subject, event.start);
      const startDay = this.dayOfWeek[event.start.getDay()]; // 0 (Sunday) to 6 (Saturday)
      const endDay = this.dayOfWeek[event.end.getDay()]; // 0 (Sunday) to 6 (Saturday)

      const startHour = event.start.getHours().toString().padStart(2, '0');
      const startMinute = event.start.getMinutes().toString().padStart(2, '0');
      const endHour = event.end.getHours().toString().padStart(2, '0');
      const endMinute = event.end.getMinutes().toString().padStart(2, '0');
      console.log(`Event starts on ${startDay} at ${startHour}:${startMinute} and ends on ${endDay} at ${endHour}:${endMinute}`);

      if (startDay !== endDay) {
        // Event spans multiple days
        console.log(`Event starts on ${startDay} and ends on ${endDay}`);
        let current = new Date(event.start);
        while (current < event.end) {
          const dayName = this.dayOfWeek[current.getDay()];
          const userSchedule = await this.scheduleRepository.findOne({ where: { user: { id_user: event.user.id_user } }, relations: ['user'] });
          const daySchedule = userSchedule[dayName];


          // Determina el rango horario para este día
          let dayStart = new Date(current);
          let dayEnd = new Date(current);
          if (current.toDateString() === event.start.toDateString()) {
            // Primer día: empieza en la hora de inicio
            dayStart = new Date(event.start);
            dayEnd.setHours(23, 59, 59, 999);
          } else if (current.toDateString() === event.end.toDateString()) {
            // Último día: termina en la hora de fin
            dayStart.setHours(0, 0, 0, 0);
            dayEnd = new Date(event.end);
          } else {
            // Día intermedio: todo el día
            dayStart.setHours(0, 0, 0, 0);
            dayEnd.setHours(23, 59, 59, 999);
          }

          const dayStartHour = dayStart.getHours().toString().padStart(2, '0');
          const dayStartMinute = dayStart.getMinutes().toString().padStart(2, '0');
          const dayEndHour = dayEnd.getHours().toString().padStart(2, '0');
          const dayEndMinute = dayEnd.getMinutes().toString().padStart(2, '0');

          if (daySchedule !== undefined) {
            // Filtra el horario del usuario para este rango
            const filteredSchedule = daySchedule.filter(elem => {
              elem.id_user = event.user.id_user;
              const absense_date = new Date(current);
              absense_date.setHours(elem.start.split(':')[0], elem.start.split(':')[1]);
              elem.date_absence = absense_date;
              elem.work = event.body;
              // Solo los tramos dentro del rango de este día
              console.log(`Checking schedule from ${elem.start} to ${elem.end} against day range ${dayStart.getHours()}:${dayStart.getMinutes().toString().padStart(2, '0')} - ${dayEnd.getHours()}:${dayEnd.getMinutes().toString().padStart(2, '0')}`,
                elem.start,
                '>=',
                `${dayStartHour}:${dayStartMinute}`,
                elem.start >= `${dayStartHour}:${dayStartMinute}`);
              return (
                elem.start >= `${dayStartHour}:${dayStartMinute}` &&
                elem.end <= `${dayEndHour}:${dayEndMinute}`
              );
            });

            for (const elem of filteredSchedule) {
              elem.user = event.user;
              const newAbsence = this.absenceRepository.create(elem);
              await this.absenceRepository.save(newAbsence);
            }
          }
          // Avanza al siguiente día
          current.setDate(current.getDate() + 1);
          current.setHours(0, 0, 0, 0);
        }
      } else if (parseInt(endHour) - parseInt(startHour) > 1) {
        // Event spans multiple hours within the same day
        const startMinute = event.start.getMinutes().toString().padStart(2, '0');
        const endMinute = event.end.getMinutes().toString().padStart(2, '0');
        const userSchedule = await this.scheduleRepository.findOne({ where: { user: { id_user: event.user.id_user } }, relations: ['user'] });
        const daySchedule = userSchedule[startDay];
        const filteredSchedule = daySchedule.filter(elem => {
          elem.id_user = event.user.id_user;
          // Set the date_absence to the event start date with the schedule start time
          const absense_date = new Date(event.start);
          absense_date.setHours(elem.start.split(':')[0], elem.start.split(':')[1]);
          elem.date_absence = absense_date;
          elem.work = event.body;
          return elem.start >= `${startHour}:${startMinute}` && elem.end <= `${endHour}:${endMinute}`
        });

        filteredSchedule.forEach(async elem => {
          elem.user = event.user;

          const newAbsence = this.absenceRepository.create(elem);
          await this.absenceRepository.save(newAbsence);
        });

      } else {
        // Event is within a single hour
        console.log(`Event is within a single hour: ${startHour}`);
        // Find the closest subject minute
        event.start.setMinutes(parseInt(this.subjectHours[startHour]));
        event.end.setMinutes(event.start.getMinutes() + 55)
        event.end.setHours(event.start.getHours() + 1);

        const userSchedule = await this.scheduleRepository.findOne({ where: { user: { id_user: event.user.id_user } }, relations: ['user'] });
        const daySchedule = userSchedule[startDay];
        const filteredSchedule = daySchedule.filter(elem => {
          elem.id_user = event.user.id_user;
          // Set the date_absence to the event start date with the schedule start time
          const absense_date = new Date(event.start);
          absense_date.setHours(elem.start.split(':')[0], elem.start.split(':')[1]);
          elem.date_absence = absense_date;
          elem.work = event.body;
          return elem.start >= `${startHour}:${startMinute}` && elem.end <= `${endHour}:${endMinute}`
        });

        filteredSchedule.forEach(async elem => {
          elem.user = event.user;

          const newAbsence = this.absenceRepository.create(elem);
          await this.absenceRepository.save(newAbsence);
        });
      }

      // After processing, mark the event as processed
      await this.eventRepository.update(event.id_event, { processed: true });

    });

  }
}

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

  async createEventDireccio(eventDto: createEventDto): Promise<CalendarEvent> {
    const event = this.eventRepository.create(eventDto);

    // helper: normalize strings (remove diacritics, punctuation, lowercase)
    const normalize = (s: string) =>
      s
        .normalize?.('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // try find by email first if provided
    if (eventDto.email) {
      const userByEmail = await this.userRepository.findOne({ where: { email: eventDto.email } });
      if (userByEmail) {
        event.user = userByEmail;
        event.body = await this.parseHTMLBody(eventDto.body);
        const saved = await this.eventRepository.save(event);
        return saved;
      }
    }

    // if no email match, try to extract name tokens from subject like "Óscar Esteve (GiH)"
    const subject = eventDto.subject ?? '';
    const cleaned = subject.replace(/\(.*?\)/g, '').trim(); // remove parenthesis content
    if (!cleaned) {
      throw new HttpException('No subject to parse and no email provided to find user', HttpStatus.BAD_REQUEST);
    }
    const tokens = normalize(cleaned).split(' ').filter(t => t.length > 0);

    // fetch all users and try to match tokens against common name fields
    const users = await this.userRepository.find();
    let matchedUser = null;
    for (const u of users) {
      // build candidate full name from possible fields (tolerant)
      const candidateParts = [
        // common field names: adjust if your User entity uses different names
        (u as any).firstName,
        (u as any).lastName,
        (u as any).name,
        (u as any).surname,
        (u as any).nombre,
        (u as any).apellidos,
      ].filter(Boolean);
      const candidate = normalize(candidateParts.join(' '));
      // require all tokens to be present in candidate (order independent)
      if (tokens.every(tok => candidate.includes(tok))) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new HttpException('User not found by subject or email', HttpStatus.NOT_FOUND);
    }

    event.user = matchedUser;
    event.body = await this.parseHTMLBody(eventDto.body);
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

    for (const event of events) {
      console.log('Processing event:', event.id_event, event.subject, event.start);

      const startDayIdx = event.start.getDay();
      const endDayIdx = event.end.getDay();
      const startDay = this.dayOfWeek[startDayIdx];
      const endDay = this.dayOfWeek[endDayIdx];

      // Ensure minimum duration of 55 minutes. If shorter, extend end to start + 55min.
      const MIN_DURATION_MS = 55 * 60 * 1000;
      // Use a local effectiveEnd so we don't mutate the DB entity unintentionally
      let effectiveEnd = new Date(event.end);
      if ((effectiveEnd.getTime() - event.start.getTime()) < MIN_DURATION_MS) {
        effectiveEnd = new Date(event.start.getTime() + MIN_DURATION_MS);
      }

      const startHour = event.start.getHours().toString().padStart(2, '0');
      const startMinute = event.start.getMinutes().toString().padStart(2, '0');
      // use effectiveEnd for calculations below
      const endHour = effectiveEnd.getHours().toString().padStart(2, '0');
      let endMinute = effectiveEnd.getMinutes().toString().padStart(2, '0');

      // Obtén el horario del usuario solo una vez
      const userSchedule = await this.scheduleRepository.findOne({ where: { user: { id_user: event.user.id_user } }, relations: ['user'] });

      // Función auxiliar para crear ausencias
      const createAbsences = async (dayName: string, rangeStart: string, rangeEnd: string, dateRef: Date) => {
        const daySchedule = userSchedule?.[dayName];
        if (!daySchedule) return;

        const filteredSchedule = daySchedule.filter(elem => {
          elem.id_user = event.user.id_user;
          const absense_date = new Date(dateRef);
          absense_date.setHours(Number(elem.start.split(':')[0]), Number(elem.start.split(':')[1]));
          elem.date_absence = absense_date;
          elem.work = event.body;
          return elem.start >= rangeStart && elem.end <= rangeEnd;
        });

        for (const elem of filteredSchedule) {
          elem.user = event.user;
          const newAbsence = this.absenceRepository.create(elem);
          await this.absenceRepository.save(newAbsence);
        }
      };

      if (startDay !== endDay) {
        console.log('Multi-day event detected');
        // Evento de varios días
        let current = new Date(event.start);
        current.setHours(0, 0, 0, 0);

        while (current <= event.end) {
          const dayName = this.dayOfWeek[current.getDay()];
          let rangeStart = '00:00';
          let rangeEnd = '23:59';

          if (current.toDateString() === event.start.toDateString()) {
            rangeStart = `${startHour}:${startMinute}`;
          }
          if (current.toDateString() === event.end.toDateString()) {
            rangeEnd = `${endHour}:${endMinute}`;
          }

          await createAbsences(dayName, rangeStart, rangeEnd, current);
          current.setDate(current.getDate() + 1);
        }
      } else {
        console.log('Single-day event detected');
        // Evento en el mismo día
        console.log(`Creating absences for ${startDay} from ${startHour}:${startMinute} to ${endHour}:${endMinute}`);
        await createAbsences(startDay, `${startHour}:${startMinute}`, `${endHour}:${endMinute}`, event.start);
      }

      // Marca el evento como procesado
      await this.eventRepository.update(event.id_event, { processed: true });
    }
  }
}

import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import eventData from '../../../data/calendarEvent';
import { CalendarEvent } from '../../../calendarEvent/calendarEvent.entity';
import { User } from '../../../users/users.entity';
import { CalendarEventService } from '../../../calendarEvent/calendarEvent.service';
import { AbsenceService } from '../../../absence/absence.service';
import { Schedule } from '../../../schedule/schedule.entity';
import { Absence } from '../../../absence/absence.entity';

export class EventSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const eventRepository = dataSource.getRepository(CalendarEvent);
    const userRepository = dataSource.getRepository(User);
    const scheduleRepository = dataSource.getRepository(Schedule);
    const absenceRepository = dataSource.getRepository(Absence);
    const calendarEventService = new CalendarEventService(eventRepository, userRepository, scheduleRepository, absenceRepository);

    const eventEntries = await Promise.all(
      eventData.map(async (item) => {
        const eventEntry = new CalendarEvent();
        eventEntry.subject = item.body.subject;
        eventEntry.body = await calendarEventService.parseHTMLBody(item.body.body);
        eventEntry.start = new Date(item.body.start);
        eventEntry.end = new Date(item.body.end);
        eventEntry.outlook_event_id = item.body.outlook_event_id;
        eventEntry.user = await userRepository.findOne({
          where: {
            email: item.body.email,
          },
        });
        return eventEntry;
      }),
    );

    await eventRepository.save(eventEntries);

    console.log('Event seeding completed!');
  }
}

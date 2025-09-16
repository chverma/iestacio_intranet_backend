import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import scheduleData from '../../../data/schedule';
import { Schedule } from '../../../schedule/schedule.entity';
import { User } from '../../../users/users.entity';

export class ScheduleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const scheduleRepository = dataSource.getRepository(Schedule);
    const userRepository = dataSource.getRepository(User);

    const scheduleEntries = await Promise.all(
      scheduleData.map(async (item) => {
        const scheduleEntry = new Schedule();
        scheduleEntry.friday = item.friday;
        scheduleEntry.monday = item.monday;
        scheduleEntry.thursday = item.thursday;
        scheduleEntry.tuesday = item.tuesday;
        scheduleEntry.wednesday = item.wednesday;
        scheduleEntry.user = await userRepository.findOneBy({
          id_user: item.id_user,
        });
        return scheduleEntry;
      }),
    );

    await scheduleRepository.save(scheduleEntries);

    console.log('Schedule seeding completed!');
  }
}

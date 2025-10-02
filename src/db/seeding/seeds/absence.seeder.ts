import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import absenceData from '../../../data/absence';
import { Absence } from '../../../absence/absence.entity';
import { User } from '../../../users/users.entity';

export class AbsenceSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const absenceRepository = dataSource.getRepository(Absence);
    const userRepository = dataSource.getRepository(User);

    const absenceEntries = await Promise.all(
      absenceData.map(async (item) => {
        const absenceEntry = new Absence();
        absenceEntry.subject = item.subject;
        absenceEntry.location = item.location;
        absenceEntry.work = item.work;
        absenceEntry.date_absence = item.date_absence;

        absenceEntry.user = await userRepository.findOneBy({
          id_user: item.id_user,
        });
        return absenceEntry;
      }),
    );

    await absenceRepository.save(absenceEntries);

    console.log('Absence seeding completed!');
  }
}

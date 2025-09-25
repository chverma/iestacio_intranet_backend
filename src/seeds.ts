import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { User } from './users/users.entity';
import { UserSeeder } from './db/seeding/seeds/users.seeder';
import { config } from 'dotenv';
import { Schedule } from './schedule/schedule.entity';
import { ScheduleSeeder } from './db/seeding/seeds/schedule.seeder';
import { EventSeeder } from './db/seeding/seeds/calendarEvent.seeder';
import { Absence } from './absence/absence.entity';
import { CalendarEvent } from './calendarEvent/calendarEvent.entity';
import { AbsenceSeeder } from './db/seeding/seeds/absence.seeder';
config();

const options: DataSourceOptions & SeederOptions = {
  type: 'mariadb',
  host: 'database',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,

  entities: [
    User,
    Schedule,
    CalendarEvent,
    Absence
  ],
  seeds: [
    UserSeeder,
    ScheduleSeeder,
    EventSeeder,
    AbsenceSeeder
  ],
};

const dataSource = new DataSource(options);

dataSource
  .initialize()
  .then(async () => {
    await dataSource.synchronize(true);
    await runSeeders(dataSource);
    process.exit();
  })
  .catch((error) => console.log('Error initializing data source', error));

import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/users.entity';
import * as dotenv from 'dotenv';
import { Schedule } from './schedule/schedule.entity';
import { CalendarEvent } from './calendarEvent/calendarEvent.entity';
import { Absence } from './absence/absence.entity';

dotenv.config();

const config = {
  type: 'mysql',
  host: 'database',
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [
    User,
    Schedule,
    Event,
    Absence
  ],
  migrations: ['./src/migrations/*.ts'],
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);

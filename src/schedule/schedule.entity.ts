import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export type ScheduleDay = {
  start: string;
  end: string;
  location: string;
  subject: string;
};

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id_schedule: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('json')
  monday: ScheduleDay;

  @Column('json')
  tuesday: ScheduleDay;

  @Column('json')
  wednesday: ScheduleDay;

  @Column('json')
  thursday: ScheduleDay;

  @Column('json')
  friday: ScheduleDay;
}

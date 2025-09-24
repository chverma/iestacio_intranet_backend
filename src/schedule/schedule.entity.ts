import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export type ScheduleSubject = {
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
  monday: ScheduleSubject[];

  @Column('json')
  tuesday: ScheduleSubject[];

  @Column('json')
  wednesday: ScheduleSubject[];

  @Column('json')
  thursday: ScheduleSubject[];

  @Column('json')
  friday: ScheduleSubject[];
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id_event: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  subject: string;

  @Column()
  body: string;

  @Column()
  start: Date

  @Column()
  end: Date

  @Column()
  outlook_event_id: string;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

}

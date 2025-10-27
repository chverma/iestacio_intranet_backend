import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Absence } from 'src/absence/absence.entity';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id_event: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User;

  @OneToMany(() => Absence, (absence) => absence.event)
  absences: Absence[];

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

  @Column({ default: false })
  processed: boolean;

}

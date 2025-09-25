import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

export type AbsenceSubject = {
  start: string;
  end: string;
  date_absence: Date;
  location: string;
  subject: string;
  work: string;
};

@Entity()
export class Absence {
  @PrimaryGeneratedColumn()
  id_absence: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('json')
  monday: AbsenceSubject[];

  @Column('json')
  tuesday: AbsenceSubject[];

  @Column('json')
  wednesday: AbsenceSubject[];

  @Column('json')
  thursday: AbsenceSubject[];

  @Column('json')
  friday: AbsenceSubject[];

  @Column('boolean', { default: false })
  justified: boolean;

  @Column('varchar', { length: 255, nullable: true })
  justified_document?: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  justified_at: Date;

  @Column('boolean', { default: false })
  syncronized: boolean;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

}

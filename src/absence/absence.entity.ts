import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class Absence {
  @PrimaryGeneratedColumn()
  id_absence: number;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('varchar', { length: 255 })
  subject: string;

  @Column('varchar', { length: 255 })
  group: string;

  @Column('varchar', { length: 255 })
  location: string;

  @Column('varchar', { length: 255 })
  work: string;

  @Column('datetime')
  date_absence: Date;

  @Column('boolean', { default: false })
  justified: boolean;

  @Column('varchar', { length: 255, nullable: true, default: null })
  justified_document: string;

  @Column('datetime', { nullable: true, default: null })
  justified_at: Date;

  @Column('boolean', { default: false })
  syncronized: boolean;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

}

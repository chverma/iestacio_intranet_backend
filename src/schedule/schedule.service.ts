import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
import { createScheduleDto, updateScheduleDto } from './schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async getAllSchedule(): Promise<Schedule[]> {
    return this.scheduleRepository.find({ relations: ['user'] });
  }

  async getSchedule(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id_schedule: id }, relations: ['user'] });
    if (!schedule) {
      throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  async createSchedule(scheduleDto: createScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepository.create(scheduleDto);
    const saved = await this.scheduleRepository.save(schedule);
    return saved;
  }

  async updateSchedule(id: number, scheduleDto: updateScheduleDto): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id_schedule: id } });
    if (!schedule) {
      throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(schedule, scheduleDto);
    return this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Schedule not found', HttpStatus.NOT_FOUND);
    }
  }
}

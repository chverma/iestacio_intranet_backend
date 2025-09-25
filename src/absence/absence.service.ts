import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Absence } from './absence.entity';
import { createAbsenceDto, updateAbsenceDto } from './absence.dto';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,
  ) {}

  async getAllAbsence(): Promise<Absence[]> {
    return this.absenceRepository.find({ relations: ['user'] });
  }

  async getAbsence(id: number): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { id_absence: id }, relations: ['user'] });
    if (!absence) {
      throw new HttpException('Absence not found', HttpStatus.NOT_FOUND);
    }
    return absence;
  }

  async getAbsenceByUserId(userId: number): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { user: { id_user: userId } }, relations: ['user'] });
    if (!absence) {
      throw new HttpException('No absence found for user', HttpStatus.NOT_FOUND);
    }
    return absence;
  }

  async getCalendarAbsenceByUserId(userId: number, res): Promise<Absence> {
    const absence = await this.getAbsenceByUserId(userId);
    return absence;
  }

  async createAbsence(absenceDto: createAbsenceDto): Promise<Absence> {
    const absence = this.absenceRepository.create(absenceDto);
    const saved = await this.absenceRepository.save(absence);
    return saved;
  }

  async updateAbsence(id: number, absenceDto: updateAbsenceDto): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { id_absence: id } });
    if (!absence) {
      throw new HttpException('Absence not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(absence, absenceDto);
    return this.absenceRepository.save(absence);
  }

  async deleteAbsence(id: number): Promise<void> {
    const result = await this.absenceRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Absence not found', HttpStatus.NOT_FOUND);
    }
  }
}

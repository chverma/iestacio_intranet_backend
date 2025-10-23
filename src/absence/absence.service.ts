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

  async getAllAbsence({ from: fromIso, to: toIso }): Promise<Absence[]> {
    return this.absenceRepository.find({ relations: ['user'] });
  }

  async getAbsence(id: number): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { id_absence: id }, relations: ['user'] });
    if (!absence) {
      throw new HttpException('Absence not found', HttpStatus.NOT_FOUND);
    }
    return absence;
  }

  async getAbsenceByUserId(userId: number, { from: fromIso, to: toIso }): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { user: { id_user: userId } }, relations: ['user'] });
    if (!absence) {
      throw new HttpException('No absence found for user', HttpStatus.NOT_FOUND);
    }
    return absence;
  }

  async getCalendarAbsenceByUserId(userId: number, { from: fromIso, to: toIso }): Promise<Absence> {
    const absence = await this.getAbsenceByUserId(userId, { from: fromIso, to: toIso });
    return absence;
  }

  async getCalendarAbsence({ from: fromIso, to: toIso }): Promise<Absence[]> {
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (fromIso && toIso) {
      fromDate = new Date(fromIso);
      toDate = new Date(toIso);
    } else {
      const now = new Date();
      fromDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      toDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    }
    return this.absenceRepository.createQueryBuilder('absence')
      .leftJoinAndSelect('absence.user', 'user')
      .where('absence.date_absence BETWEEN :start AND :end', {
        start: fromDate,
        end: toDate,
      })
      .orderBy('absence.date_absence', 'ASC')
      .getMany();
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

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

  async getAllAbsence({
    from: fromIso,
    to: toIso,
    order,
    page,
    limit,
    search,
  }: {
    from: string | null;
    to: string | null;
    order: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ items: Absence[]; total: number; page: number; limit: number }> {
    const qb = this.absenceRepository.createQueryBuilder('absence')
      .leftJoinAndSelect('absence.user', 'user');

    if (search && search.trim().length) {
      const q = `%${search.toLowerCase()}%`;
      qb.where('LOWER(user.name) LIKE :q OR LOWER(user.surname) LIKE :q', { q });
    }

    if (order) {
      qb.orderBy('absence.date_absence', order.toUpperCase() as 'ASC' | 'DESC');
    }

    const pageNum = Math.max(1, Number.isFinite(page) ? page : parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Number.isFinite(limit) ? limit : parseInt(String(limit), 10) || 10);
    const take = Math.min(limitNum, 100);
    const skip = (pageNum - 1) * take;

    qb.skip(skip).take(take);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page: pageNum, limit: take };
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

  async bulkDeleteAbsence(ids: number[]): Promise<{ deleted: number }> {
    if (!Array.isArray(ids) || !ids.length) return { deleted: 0 };
    const result = await this.absenceRepository.delete(ids);
    return { deleted: result.affected ?? 0 };
  }
}

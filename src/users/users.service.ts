import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UtilsService } from '../utils/utils.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { User } from './users.entity';
@Injectable()
export class UsersService {
  constructor(
    private readonly utilsService: UtilsService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getAllUser(pageNum: number, limitNum: number, search?: string): Promise<{ items: User[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number.isFinite(pageNum) ? pageNum : parseInt(String(pageNum), 10) || 1);
    const limit = Math.max(1, Number.isFinite(limitNum) ? limitNum : parseInt(String(limitNum), 10) || 10);
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const qb = this.usersRepository.createQueryBuilder('user');

    if (search && search.trim().length) {
      const q = `%${search.toLowerCase()}%`;
      qb.where('LOWER(user.name) LIKE :q OR LOWER(user.email) LIKE :q OR LOWER(user.surname) LIKE :q', { q });
    }

    qb.orderBy('user.id_user', 'ASC').skip(skip).take(take);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit: take };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const usuario = await this.usersRepository.create(createUserDto);
    const passwordHash = await bcrypt.hash(await usuario.password, 10);
    usuario.password = passwordHash;
    return this.usersRepository.save(usuario);
  }

  async getUser(id_user: number): Promise<User | string | null> {
    const user = await this.usersRepository.findOneBy({ id_user });

    if (user != null) {
        return user;
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id_user: updateUserDto.id_user },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async deleteUser(id_user: number): Promise<void> {
    await this.usersRepository.delete(id_user);
  }

  async bulkDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
    if (!Array.isArray(ids) || !ids.length) return { deleted: 0 };
    const result = await this.usersRepository.delete(ids);
    return { deleted: result.affected ?? 0 };
  }

}

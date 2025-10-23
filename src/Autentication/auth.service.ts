import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async generateToken(id_user: number, res?: Response): Promise<string> {
    const token = uuidv4();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);

    await this.userRepository.update(id_user, {
      token,
      tokenExpiration: expirationDate,
    });

    // Si nos pasan la Response, creamos la cookie aquí
    if (res) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 días
      };
      res.cookie('auth_token', token, cookieOptions);
    }

    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { token } });
    if (!user) return false;

    const now = new Date();
    if (user.tokenExpiration < now) {
      await this.userRepository.update(user.id_user, {
        token: null,
        tokenExpiration: null,
      });
      return false;
    }

    return true;
  }

  async clearToken(id_user: number, res?: Response): Promise<void> {
    await this.userRepository.update(id_user, {
      token: null,
      tokenExpiration: null,
    });

    if (res) {
      // Intentar limpiar la cookie en la respuesta
      res.clearCookie('auth_token');
    }
  }

    async validateUser(email: string, password: string, res: Response): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { 'email': email, 'role': 0 } });
    if (user && (await bcrypt.compare(password, user.password))) {
      await this.generateToken(user.id_user, res);
      return user;
    }
    return null;
  }

  async getUserByToken(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { token: token },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }
}

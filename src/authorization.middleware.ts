import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from './Autentication/auth.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  private normalizeIp(ip?: string): string | null {
    if (!ip) return null;
    ip = ip.split(',')[0].trim(); // x-forwarded-for puede contener lista
    if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', ''); // IPv4-mapped IPv6
    return ip.replace(/^\[|]$/g, '');
  }

  private ipToLong(ip: string): number {
    const parts = ip.split('.');
    if (parts.length !== 4) return 0;
    return parts.reduce((acc, p) => (acc << 8) + (Number(p) || 0), 0) >>> 0;
  }

  private cidrMatch(ip: string, cidr: string): boolean {
    if (!cidr.includes('/')) return ip === cidr;
    const [range, bitsStr] = cidr.split('/');
    const bits = parseInt(bitsStr, 10);
    if (isNaN(bits) || bits < 0 || bits > 32) return false;
    const ipLong = this.ipToLong(ip);
    const rangeLong = this.ipToLong(range);
    const mask = (0xffffffff << (32 - bits)) >>> 0;
    return (ipLong & mask) === (rangeLong & mask);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Token validation (optional)
    if (process.env.ENABLE_TOKEN_VALIDATION === 'true') {
      const authHeader = req.headers['authorization'] as string | undefined;
      if (!authHeader) {
        throw new UnauthorizedException('Token no encontrado');
      }
      const parts = authHeader.split(' ');
      const token = parts.length > 1 ? parts[1] : parts[0];
      const isValid = await this.authService.validateToken(token);
      if (!isValid) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
    }

    // IP validation (optional)
    if (process.env.ENABLE_IP_VALIDATION === 'true') {
      const rawIp =
        (req.headers['x-forwarded-for'] as string) ||
        (req.headers['x-real-ip'] as string) ||
        (req.socket && (req.socket.remoteAddress as string));
      const clientIp = this.normalizeIp(rawIp);

      const allowed = (process.env.ALLOWED_IPS || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      let ok = false;
      if (clientIp) {
        for (const a of allowed) {
          if (!a) continue;
          if (a.includes('/')) {
            if (this.cidrMatch(clientIp, a)) { ok = true; break; }
          } else {
            if (clientIp === a) { ok = true; break; }
          }
        }
      }

      if (!ok) {
        throw new UnauthorizedException(`IP no autorizada: ${clientIp ?? 'unknown'}`);
      }
    }

    next();
  }
}

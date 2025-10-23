import { Controller, Get, Post, Body, Req, Res, Render } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
class LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(
    private readonly authService: AuthService,
  ) {}

    // GET /auth/login -> renders views/login.hbs
    @Get('login')
    @Render('login')
    showLogin(@Req() req: Request) {
        // If you use express-session, req.session can contain the logged user
        const user = (req as any).session?.user ?? null;
        return { user, error: null };
    }

    // POST /auth/login -> authenticate and redirect / render login with error
    @Post('login')
    async doLogin(@Body() body: LoginDto, @Req() req: Request, @Res() res: Response) {
        console.log("POST: login")
        const { email, password } = body ?? {};
        if (!email || !password) {
            return res.status(400).render('login', { error: 'email and password required', email: email ?? '' });
        }

        const found = await this.authService.validateUser(email, password, res);
        console.log("POST_login:", found)
        if (!found) {
            return res.status(401).render('login', { error: 'Invalid credentials', email });
        } else {
            return res.redirect('/auth/admin');
        }
    }

    // GET /auth/admin -> show admin.hbs (protected)
    @Get('admin')
    @Render('admin')
    async showAdmin(@Req() req: Request, @Res() res: Response) {
        return {};
    }
}
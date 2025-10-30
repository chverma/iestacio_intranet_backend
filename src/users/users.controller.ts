import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/Autentication/auth.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getAllUser(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('q') query = '',
  ) {
    try {
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;

      // sanitize 'q': trim, cap length and allow only safe chars (alnum, spaces and common email chars)
      const raw = String(query ?? '').trim().slice(0, 100);
      const sanitized = raw.replace(/[^a-zA-Z0-9@._\-\s]/g, '');
      const search = sanitized.length ? sanitized : null;

      return await this.usersService.getAllUser(pageNum, limitNum, search);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }

  /*@Get('by-token/:token')
  getUserByToken(@Param('token') tokenStr: string) {
    return this.usersService.getUserByToken(tokenStr);
  }*/

  @Get(':id')
  getUser(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.getUser(userId);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.updateUser({
      ...updateUserDto,
      id_user: userId,
    });
  }

  @Delete('bulk-delete')
  async bulkDeleteUsers(@Body() body: { ids: number[] }) {
    if (!body || !Array.isArray(body.ids) || !body.ids.length) {
      throw new HttpException('No user IDs provided', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.bulkDeleteUsers(body.ids);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.deleteUser(userId);
  }
}

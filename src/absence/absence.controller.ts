import { Body, Controller, Get, Param, Post, Put, Delete, HttpException, HttpStatus, Res, Render } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { createAbsenceDto, updateAbsenceDto } from './absence.dto';
import { Response } from 'express';

@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Get()
  async getAllAbsence() {
    return this.absenceService.getAllAbsence();
  }

  @Get(':id')
  async getAbsence(@Param('id') id: string) {
    const absenceId = parseInt(id);
    if (isNaN(absenceId)) {
      throw new HttpException('Invalid absence ID', HttpStatus.BAD_REQUEST);
    }
    return this.absenceService.getAbsence(absenceId);
  }

  @Get('user/:id')
  async getAbsenceByUserId(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }

    return this.absenceService.getAbsenceByUserId(userId);
  }

  @Get('user/:id/absence')
  async getCalendarAbsenceByUserId(@Param('id') id: string, @Res() res: Response) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return res.render('calendar', {absence: await this.absenceService.getCalendarAbsenceByUserId(userId, res)});
  }

  @Post()
  async createAbsence(@Body() absenceDto: createAbsenceDto) {
    return this.absenceService.createAbsence(absenceDto);
  }

  @Put(':id')
  async updateAbsence(@Param('id') id: string, @Body() absenceDto: updateAbsenceDto) {
    const absenceId = parseInt(id);
    if (isNaN(absenceId)) {
      throw new HttpException('Invalid absence ID', HttpStatus.BAD_REQUEST);
    }
    return this.absenceService.updateAbsence(absenceId, absenceDto);
  }

  @Delete(':id')
  async deleteAbsence(@Param('id') id: string) {
    const absenceId = parseInt(id);
    if (isNaN(absenceId)) {
      throw new HttpException('Invalid absence ID', HttpStatus.BAD_REQUEST);
    }
    return this.absenceService.deleteAbsence(absenceId);
  }
}

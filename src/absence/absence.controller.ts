import { Body, Controller, Get, Param, Post, Put, Delete, HttpException, HttpStatus, Res, Render, Query } from '@nestjs/common';
import { AbsenceService } from './absence.service';
import { createAbsenceDto, updateAbsenceDto } from './absence.dto';
import { Response } from 'express';

@Controller('absence')
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  // helper to validate and normalize from/to query params
  private parseDateRange(from?: string, to?: string): { fromIso: string | null; toIso: string | null } {
    let fromIso: string | null = null;
    let toIso: string | null = null;

    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) {
        throw new HttpException('Invalid "from" date', HttpStatus.BAD_REQUEST);
      }
      fromIso = d.toISOString();
    }
    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) {
        throw new HttpException('Invalid "to" date', HttpStatus.BAD_REQUEST);
      }
      toIso = d.toISOString();
    }
    return { fromIso, toIso };
  }

  @Get()
  async getAllAbsence(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('order') order?: string,
  ) {
    const { fromIso, toIso } = this.parseDateRange(from, to);
    if (!order) {
      order = 'ASC';
    }
    return this.absenceService.getAllAbsence({ from: fromIso, to: toIso, order });
  }
  @Get('calendar')
  async getCalendarAbsence(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const { fromIso, toIso } = this.parseDateRange(from, to);
    return res.render('absence', { absence: await this.absenceService.getCalendarAbsence({ from: fromIso, to: toIso }) });
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
  async getAbsenceByUserId(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    const { fromIso, toIso } = this.parseDateRange(from, to);
    return this.absenceService.getAbsenceByUserId(userId, { from: fromIso, to: toIso });
  }

  @Get('user/:id/absence')
  async getCalendarAbsenceByUserId(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    const { fromIso, toIso } = this.parseDateRange(from, to);
    return res.render('calendar', {
      absence: await this.absenceService.getCalendarAbsenceByUserId(userId, { from: fromIso, to: toIso }),
    });
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

  @Delete('bulk-delete')
  async bulkDeleteAbsence(@Body() body: { ids: number[] }) {
    if (!body || !Array.isArray(body.ids) || !body.ids.length) {
      throw new HttpException('No absence IDs provided', HttpStatus.BAD_REQUEST);
    }
    return this.absenceService.bulkDeleteAbsence(body.ids);
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

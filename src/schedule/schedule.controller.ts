import { Body, Controller, Get, Param, Post, Put, Delete, HttpException, HttpStatus, Res, Render } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { createScheduleDto, updateScheduleDto } from './schedule.dto';
import { Response } from 'express';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAllSchedule() {
    return this.scheduleService.getAllSchedule();
  }

  @Get(':id')
  async getSchedule(@Param('id') id: string) {
    const scheduleId = parseInt(id);
    if (isNaN(scheduleId)) {
      throw new HttpException('Invalid schedule ID', HttpStatus.BAD_REQUEST);
    }
    return this.scheduleService.getSchedule(scheduleId);
  }

  @Get('user/:id')
  async getScheduleByUserId(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }

    return this.scheduleService.getScheduleByUserId(userId);
  }

  @Get('user/:id/calendar')
  async getCalendarScheduleByUserId(@Param('id') id: string, @Res() res: Response) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return res.render('calendar', {schedule: await this.scheduleService.getCalendarScheduleByUserId(userId, res)});
  }

  @Post()
  async createSchedule(@Body() scheduleDto: createScheduleDto) {
    return this.scheduleService.createSchedule(scheduleDto);
  }

  @Put(':id')
  async updateSchedule(@Param('id') id: string, @Body() scheduleDto: updateScheduleDto) {
    const scheduleId = parseInt(id);
    if (isNaN(scheduleId)) {
      throw new HttpException('Invalid schedule ID', HttpStatus.BAD_REQUEST);
    }
    return this.scheduleService.updateSchedule(scheduleId, scheduleDto);
  }

  @Delete(':id')
  async deleteSchedule(@Param('id') id: string) {
    const scheduleId = parseInt(id);
    if (isNaN(scheduleId)) {
      throw new HttpException('Invalid schedule ID', HttpStatus.BAD_REQUEST);
    }
    return this.scheduleService.deleteSchedule(scheduleId);
  }
}

import { Body, Controller, Get, Param, Post, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { createScheduleDto, updateScheduleDto } from './schedule.dto';

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

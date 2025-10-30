import { Body, Controller, Get, Param, Post, Put, Delete, HttpException, HttpStatus, Res, Render, Query } from '@nestjs/common';
import { CalendarEventService } from './calendarEvent.service';
import { createEventDto, updateEventDto } from './calendarEvent.dto';
import { Response } from 'express';

@Controller('calendarEvent')
export class CalendarEventController {
  constructor(private readonly calendarEventService: CalendarEventService) {}

  @Get()
  async getAllEvent(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('q') query = '',
  ) {
    try {
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const raw = String(query ?? '').trim().slice(0, 100);
      const sanitized = raw.replace(/[^a-zA-Z0-9@._\-\s]/g, '');
      const search = sanitized.length ? sanitized : null;
      return await this.calendarEventService.getAllEvent(pageNum, limitNum, search);
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

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      throw new HttpException('Invalid event ID', HttpStatus.BAD_REQUEST);
    }
    return this.calendarEventService.getEvent(eventId);
  }

  @Get('user/:id')
  async getEventByUserId(@Param('id') id: string) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }

    return this.calendarEventService.getEventByUserId(userId);
  }

  @Get('user/:id/event')
  async getCalendarEventByUserId(@Param('id') id: string, @Res() res: Response) {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
    }
    return res.render('calendar', {event: await this.calendarEventService.getCalendarEventByUserId(userId, res)});
  }

  @Post()
  async createEvent(@Body() eventDto: createEventDto) {
    if (eventDto.email.startsWith(process.env.DIRECCIO_EMAIL_PREFIX || '')) {
      return this.calendarEventService.createEventDireccio(eventDto);
    }
    return this.calendarEventService.createEvent(eventDto);
  }

  @Put('by-outlookid/:id')
  async updateEventByOutlookId(@Param('id') id: string, @Body() eventDto: updateEventDto) {
    return this.calendarEventService.updateEventByOutlookId(id, eventDto);
  }

  @Put(':id')
  async updateEvent(@Param('id') id: string, @Body() eventDto: updateEventDto) {
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      throw new HttpException('Invalid event ID', HttpStatus.BAD_REQUEST);
    }
    return this.calendarEventService.updateEvent(eventId, eventDto);
  }

  @Delete('bulk-delete')
  async bulkDeleteEvents(@Body() body: { ids: number[] }) {
    if (!body || !Array.isArray(body.ids) || !body.ids.length) {
      throw new HttpException('No event IDs provided', HttpStatus.BAD_REQUEST);
    }
    return this.calendarEventService.bulkDeleteEvents(body.ids);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      throw new HttpException('Invalid event ID', HttpStatus.BAD_REQUEST);
    }
    return this.calendarEventService.deleteEvent(eventId);
  }
}

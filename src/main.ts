import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Helpers para Handlebars
  hbs.registerHelper('array', function() {
    return Array.prototype.slice.call(arguments, 0, -1);
  });

  hbs.registerHelper('findSlot', function(dayArray, slot) {
    if (slot === undefined) return null;
    if (!Array.isArray(dayArray)) return null;
    const [start, end] = slot.split('-');
    return dayArray.find(item => item.start === start && item.end === end) || null;
  });

  hbs.registerHelper('formatHour', function(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
  });

  hbs.registerHelper('formatDay', function(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric' });
  });

  // Helper para detectar el turno de clase según franjas horarias específicas
  hbs.registerHelper('classShift', function(dateStr) {
    const date = new Date(dateStr);
    const hour = date.getHours();
    const minute = date.getMinutes();

    const totalMinutes = hour * 60 + minute;

    return (Math.floor((totalMinutes) / 55) % 2 == 0);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

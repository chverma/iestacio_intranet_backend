import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { UtilsModule } from './utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/users.entity';
import { AuthorizationMiddleware } from './authorization.middleware';
import { AuthService } from './Autentication/auth.service';
import { FilesModule } from './files/files.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AbsenceModule } from './absence/absence.module';
import { CalendarEventModule } from './calendarEvent/calendarEvent.module';
import { ScheduleModule as ScheduleCron } from '@nestjs/schedule';
import { AuthModule } from './Autentication/auth.module';

@Module({
  imports: [
    ScheduleCron.forRoot(),
    ConfigModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'database',
        port: +configService.get('MYSQL_PORT') || 3306,
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    UtilsModule,
    FilesModule,
    ScheduleModule,
    AbsenceModule,
    AuthModule,
    CalendarEventModule
  ],
  controllers: [],
  providers: [AuthorizationMiddleware, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .exclude({ path: 'calendarevent', method: RequestMethod.POST })
      .exclude({ path: 'users', method: RequestMethod.POST })
      .exclude({ path: 'auth/login', method: RequestMethod.GET })
      .exclude({ path: 'auth/login', method: RequestMethod.POST })
      .exclude({ path: 'schedule', method: RequestMethod.POST })
      .exclude({ path: 'absence/calendar', method: RequestMethod.GET })
      .forRoutes('*');
  }
}

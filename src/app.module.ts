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
import { Schedule } from './schedule/schedule.entity';
import { AbsenceModule } from './absence/absence.module';
import { Absence } from './absence/absence.entity';
import { CalendarEventModule } from './calendarEvent/calendarEvent.module';
import { CalendarEvent } from './calendarEvent/calendarEvent.entity';
import { ScheduleModule as ScheduleCron } from '@nestjs/schedule';

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
        /*entities: [
          User,
          Schedule,
          Absence,
          CalendarEvent
        ],*/
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
    CalendarEventModule
  ],
  controllers: [],
  providers: [AuthorizationMiddleware, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .exclude({ path: 'users/login', method: RequestMethod.POST })
      .forRoutes('*');
  }
}

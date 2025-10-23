import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { User } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}
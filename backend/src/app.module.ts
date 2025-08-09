import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { CoachesModule } from './coaches/coaches.module';
import { CoursesModule } from './courses/courses.module';
import { CourseSchedulesModule } from './course-schedules/course-schedules.module';
import { BookingsModule } from './bookings/bookings.module';
import { CheckInsModule } from './checkins/checkins.module';
import { GroupClassCardsModule } from './group-class-cards/group-class-cards.module';
import { PersonalTrainingCardsModule } from './personal-training-cards/personal-training-cards.module';
import { MembershipCardsModule } from './membership-cards/membership-cards.module';
import { SeedModule } from './database/seeds/seed.module';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database') as TypeOrmModuleOptions,
    }),
    AuthModule,
    BrandsModule,
    StoresModule,
    UsersModule,
    MembersModule,
    CoachesModule,
    CoursesModule,
    CourseSchedulesModule,
    BookingsModule,
    CheckInsModule,
    GroupClassCardsModule,
    PersonalTrainingCardsModule,
    MembershipCardsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CourseSchedulesController } from './course-schedules.controller';
import { CourseSchedulesService } from './course-schedules.service';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
import { Store } from '../entities/store.entity';
import { Coach } from '../entities/coach.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseSchedule, Course, User, Store, Coach]),
    CacheModule.register(),
  ],
  controllers: [CourseSchedulesController],
  providers: [CourseSchedulesService],
  exports: [CourseSchedulesService],
})
export class CourseSchedulesModule {}

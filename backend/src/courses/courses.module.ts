import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from '../entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    CacheModule.register({
      ttl: 5 * 60, // 5 minutes
    }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
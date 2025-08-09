import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from '../entities/booking.entity';
import { CourseSchedule } from '../entities/course-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, CourseSchedule]),
    CacheModule.register({
      ttl: 5 * 60, // 5 minutes
    }),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

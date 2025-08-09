import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CheckInsService } from './checkins.service';
import { CheckInsController } from './checkins.controller';
import { CheckIn } from '../entities/check-in.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckIn]),
    CacheModule.register({
      ttl: 5 * 60, // 5 minutes
    }),
  ],
  controllers: [CheckInsController],
  providers: [CheckInsService],
  exports: [CheckInsService],
})
export class CheckInsModule {}

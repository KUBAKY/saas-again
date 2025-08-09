import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { CoachesService } from './coaches.service';
import { CoachesController } from './coaches.controller';
import { Coach } from '../entities/coach.entity';
import { Store } from '../entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coach, Store]),
    CacheModule.register({
      ttl: 300, // 5分钟缓存
    }),
  ],
  controllers: [CoachesController],
  providers: [CoachesService],
  exports: [CoachesService],
})
export class CoachesModule {}
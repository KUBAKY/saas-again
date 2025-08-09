import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { Store } from '../entities/store.entity';
import { Brand } from '../entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Brand]),
    CacheModule.register({
      ttl: 300, // 5分钟缓存
    }),
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}

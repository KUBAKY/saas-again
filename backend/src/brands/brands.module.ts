import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from '../entities/brand.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    CacheModule.register({
      ttl: 300, // 5分钟缓存
    }),
  ],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { Member } from '../entities/member.entity';
import { Store } from '../entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Store]),
    CacheModule.register({
      ttl: 300, // 5分钟缓存
    }),
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}

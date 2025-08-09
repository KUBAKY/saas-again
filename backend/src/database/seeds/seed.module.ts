import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import {
  Brand,
  Store,
  User,
  Role,
  Permission,
  Member,
  Coach,
  Course,
  MembershipCard,
} from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brand,
      Store,
      User,
      Role,
      Permission,
      Member,
      Coach,
      Course,
      MembershipCard,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}

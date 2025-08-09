import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipCardsService } from './membership-cards.service';
import { MembershipCardsController } from './membership-cards.controller';
import { MembershipCard } from '../entities/membership-card.entity';
import { Member } from '../entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipCard, Member])],
  controllers: [MembershipCardsController],
  providers: [MembershipCardsService],
  exports: [MembershipCardsService],
})
export class MembershipCardsModule {}
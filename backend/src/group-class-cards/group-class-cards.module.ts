import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupClassCardsController } from '../controllers/group-class-cards.controller';
import { GroupClassCardsService } from '../services/group-class-cards.service';
import { GroupClassCard } from '../entities/group-class-card.entity';
import { Member } from '../entities/member.entity';
import { MembershipCard } from '../entities/membership-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupClassCard, Member, MembershipCard])],
  controllers: [GroupClassCardsController],
  providers: [GroupClassCardsService],
  exports: [GroupClassCardsService],
})
export class GroupClassCardsModule {}

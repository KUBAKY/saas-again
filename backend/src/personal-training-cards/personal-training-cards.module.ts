import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalTrainingCardsController } from '../controllers/personal-training-cards.controller';
import { PersonalTrainingCardsService } from '../services/personal-training-cards.service';
import { PersonalTrainingCard } from '../entities/personal-training-card.entity';
import { Member } from '../entities/member.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { Coach } from '../entities/coach.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonalTrainingCard,
      Member,
      MembershipCard,
      Coach,
    ]),
  ],
  controllers: [PersonalTrainingCardsController],
  providers: [PersonalTrainingCardsService],
  exports: [PersonalTrainingCardsService],
})
export class PersonalTrainingCardsModule {}
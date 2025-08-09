import { PartialType } from '@nestjs/swagger';
import { CreatePersonalTrainingCardDto } from './create-personal-training-card.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePersonalTrainingCardDto extends PartialType(CreatePersonalTrainingCardDto) {
  @ApiPropertyOptional({
    description: '卡片状态',
    enum: ['inactive', 'active', 'frozen', 'expired', 'refunded'],
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['inactive', 'active', 'frozen', 'expired', 'refunded'])
  status?: 'inactive' | 'active' | 'frozen' | 'expired' | 'refunded';
}
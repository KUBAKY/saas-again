import { PartialType } from '@nestjs/swagger';
import { CreateGroupClassCardDto } from './create-group-class-card.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGroupClassCardDto extends PartialType(
  CreateGroupClassCardDto,
) {
  @ApiPropertyOptional({
    description: '卡片状态',
    enum: ['inactive', 'active', 'frozen', 'expired', 'refunded'],
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['inactive', 'active', 'frozen', 'expired', 'refunded'])
  status?: 'inactive' | 'active' | 'frozen' | 'expired' | 'refunded';
}

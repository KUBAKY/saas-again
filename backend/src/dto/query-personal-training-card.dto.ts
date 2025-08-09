import { IsOptional, IsString, IsEnum, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryPersonalTrainingCardDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '会员ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({
    description: '会籍卡ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  membershipCardId?: string;

  @ApiPropertyOptional({
    description: '教练ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiPropertyOptional({
    description: '私教卡类型',
    example: '高级私教卡',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: '卡片状态',
    enum: ['inactive', 'active', 'frozen', 'expired'],
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['inactive', 'active', 'frozen', 'expired'])
  status?: 'inactive' | 'active' | 'frozen' | 'expired';

  @ApiPropertyOptional({
    description: '购买开始日期',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  purchaseDateStart?: string;

  @ApiPropertyOptional({
    description: '购买结束日期',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  purchaseDateEnd?: string;

  @ApiPropertyOptional({
    description: '搜索关键词（卡号、类型）',
    example: 'PTC',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
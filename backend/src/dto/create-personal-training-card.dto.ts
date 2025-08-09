import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonalTrainingCardDto {
  @ApiProperty({
    description: '会员ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @ApiProperty({
    description: '会籍卡ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  @IsUUID()
  membershipCardId: string;

  @ApiProperty({
    description: '私教卡类型',
    example: '高级私教卡',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: '价格',
    example: 5000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: '总课时数',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalSessions: number;

  @ApiPropertyOptional({
    description: '指定教练ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiPropertyOptional({
    description: '购买日期',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: '备注',
    example: '指定张教练授课',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: '卡片设置',
    example: {
      autoActivate: true,
      transferable: false,
      refundable: true,
      coachChangeable: true,
    },
  })
  @IsOptional()
  settings?: Record<string, any>;
}

import { IsString, IsEnum, IsNumber, IsOptional, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMembershipCardDto {
  @ApiProperty({ description: '卡号' })
  @IsString()
  cardNumber: string;

  @ApiProperty({ description: '卡类型名称' })
  @IsString()
  type: string;

  @ApiProperty({ description: '计费方式', enum: ['times', 'period', 'unlimited'] })
  @IsEnum(['times', 'period', 'unlimited'])
  billingType: 'times' | 'period' | 'unlimited';

  @ApiProperty({ description: '卡片价格' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ description: '总次数（次卡）' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalSessions?: number;

  @ApiPropertyOptional({ description: '有效期（天数）' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3650) // 最多10年
  @Type(() => Number)
  validityDays?: number;

  @ApiProperty({ description: '开卡日期' })
  @IsDateString()
  issueDate: string;

  @ApiPropertyOptional({ description: '到期日期' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: '激活日期' })
  @IsOptional()
  @IsDateString()
  activationDate?: string;

  @ApiPropertyOptional({ description: '卡状态', enum: ['active', 'inactive', 'expired', 'frozen', 'refunded'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'expired', 'frozen', 'refunded'])
  status?: 'active' | 'inactive' | 'expired' | 'frozen' | 'refunded';

  @ApiPropertyOptional({ description: '备注信息' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: '卡片配置' })
  @IsOptional()
  settings?: Record<string, any>;

  @ApiProperty({ description: '会员ID' })
  @IsUUID()
  memberId: string;
}
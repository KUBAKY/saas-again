import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryMembershipCardDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '会员ID' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ description: '卡类型' })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['active', 'inactive', 'expired', 'frozen', 'refunded'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'expired', 'frozen', 'refunded'])
  status?: 'active' | 'inactive' | 'expired' | 'frozen' | 'refunded';

  @ApiPropertyOptional({ description: '门店ID' })
  @IsOptional()
  @IsUUID()
  storeId?: string;
}
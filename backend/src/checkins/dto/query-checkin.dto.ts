import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsNumberString, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCheckInDto {
  @ApiProperty({ required: false, description: '页码', default: 1 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false, description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({ required: false, description: '会员ID' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiProperty({ required: false, description: '门店ID' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false, description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    required: false, 
    description: '排序字段', 
    enum: ['checkInTime', 'checkInMethod', 'createdAt'],
    default: 'checkInTime'
  })
  @IsOptional()
  @IsEnum(['checkInTime', 'checkInMethod', 'createdAt'])
  sortBy?: string;

  @ApiProperty({ 
    required: false, 
    description: '排序方向', 
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsNumberString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBookingDto {
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

  @ApiProperty({ required: false, description: '搜索关键字(预约编号/会员姓名)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    required: false, 
    description: '预约状态', 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'] 
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

  @ApiProperty({ required: false, description: '会员ID' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiProperty({ required: false, description: '教练ID' })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiProperty({ required: false, description: '课程ID' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

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
    enum: ['bookingNumber', 'startTime', 'endTime', 'status', 'createdAt'],
    default: 'startTime'
  })
  @IsOptional()
  @IsEnum(['bookingNumber', 'startTime', 'endTime', 'status', 'createdAt'])
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
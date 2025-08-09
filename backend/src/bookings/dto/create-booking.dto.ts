import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({ description: '结束时间' })
  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({ description: '费用', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({ 
    description: '支付方式', 
    enum: ['membership_card', 'cash', 'online_payment'],
    required: false
  })
  @IsOptional()
  @IsEnum(['membership_card', 'cash', 'online_payment'])
  paymentMethod?: 'membership_card' | 'cash' | 'online_payment';

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '会员ID' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ description: '教练ID', required: false })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiProperty({ description: '课程ID' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '门店ID' })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;
}
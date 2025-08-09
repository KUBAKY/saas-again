import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateCheckInDto {
  @ApiProperty({ description: '会员ID' })
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty({ description: '门店ID' })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ 
    description: '签到方式', 
    enum: ['manual', 'qr_code', 'facial_recognition'],
    required: false
  })
  @IsOptional()
  @IsEnum(['manual', 'qr_code', 'facial_recognition'])
  checkInMethod?: 'manual' | 'qr_code' | 'facial_recognition';

  @ApiProperty({ description: '设备信息', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiProperty({ description: '纬度', required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ description: '经度', required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
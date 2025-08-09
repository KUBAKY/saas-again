import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ description: '门店名称', example: 'FitnessPro 国贸店' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '门店编码', example: 'FP_GUOMAO' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[A-Z0-9_]+$/, {
    message: '门店编码只能包含大写字母、数字和下划线',
  })
  code: string;

  @ApiProperty({
    description: '品牌ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ description: '门店地址', example: '北京市朝阳区国贸中心B1层' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  address: string;

  @ApiProperty({ description: '联系电话', example: '010-8888-0001' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  phone: string;

  @ApiProperty({ description: '开门时间', example: '06:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '开门时间格式应为 HH:mm',
  })
  openTime: string;

  @ApiProperty({ description: '关门时间', example: '23:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '关门时间格式应为 HH:mm',
  })
  closeTime: string;

  @ApiProperty({
    description: '门店描述',
    example: '位于CBD核心区域的旗舰店',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: '门店照片URL列表',
    example: ['https://example.com/store1.jpg'],
    required: false,
  })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    description: '设施列表',
    example: ['器械区', '有氧区', '团课室'],
    required: false,
  })
  @IsOptional()
  facilities?: string[];

  @ApiProperty({ description: '经度', example: 116.4074, required: false })
  @IsOptional()
  longitude?: number;

  @ApiProperty({ description: '纬度', example: 39.9042, required: false })
  @IsOptional()
  latitude?: number;
}

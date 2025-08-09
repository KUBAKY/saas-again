import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, Length, Matches } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ description: '品牌名称', example: 'FitnessPro' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '品牌编码', example: 'FITNESS_PRO' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[A-Z0-9_]+$/, { message: '品牌编码只能包含大写字母、数字和下划线' })
  code: string;

  @ApiProperty({ description: '品牌描述', example: '专业健身连锁品牌', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: '联系电话', example: '400-888-0001', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  contactPhone?: string;

  @ApiProperty({ description: '联系邮箱', example: 'contact@fitnesspro.com', required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ description: '品牌LOGO URL', example: 'https://example.com/logo.png', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: '官网地址', example: 'https://www.fitnesspro.com', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;
}
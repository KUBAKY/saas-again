import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEmail, 
  IsUUID, 
  IsDateString,
  IsNumber,
  IsIn,
  IsArray,
  Min,
  Max,
  Length 
} from 'class-validator';

export class CreateCoachDto {
  @ApiProperty({ description: '教练姓名', example: '张教练' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @ApiProperty({ description: '员工编号', example: 'FP_GUOMAO_COACH_001' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  employeeNumber: string;

  @ApiProperty({ description: '手机号', example: '13800138001' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string;

  @ApiProperty({ description: '邮箱', example: 'coach@gym.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '性别', example: 'male', enum: ['male', 'female'] })
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({ description: '门店ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ description: '入职日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ 
    description: '专长', 
    example: ['力量训练', '减脂塑形', '功能性训练'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({ description: '从业年限', example: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experienceYears?: number;

  @ApiProperty({ description: '个人简介', example: '5年健身教练经验，专业力量训练指导', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;

  @ApiProperty({ description: '基本工资', example: 8000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @ApiProperty({ description: '课时费', example: 200, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ description: '教练头像URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '认证资质', example: ['ACSM认证', 'NASM认证'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ description: '备注', example: '优秀教练', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
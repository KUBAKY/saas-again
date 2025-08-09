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
  IsPhoneNumber,
  Min,
  Max,
  Length,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ description: '会员姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  name: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  phone: string;

  @ApiProperty({
    description: '邮箱',
    example: 'member@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: '性别',
    example: 'male',
    enum: ['male', 'female'],
  })
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({ description: '生日', example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({ description: '身高(cm)', example: 175, required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiProperty({ description: '体重(kg)', example: 70, required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @ApiProperty({
    description: '门店ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({
    description: '会员等级',
    example: 'bronze',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  })
  @IsOptional()
  @IsIn(['bronze', 'silver', 'gold', 'platinum'])
  level?: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';

  @ApiProperty({
    description: '健身目标',
    example: '减肥塑形',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  fitnessGoal?: string;

  @ApiProperty({ description: '紧急联系人', example: '李四', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  emergencyContact?: string;

  @ApiProperty({
    description: '紧急联系人电话',
    example: '13900139000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  emergencyPhone?: string;

  @ApiProperty({
    description: '会员头像URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '备注', example: '新会员', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

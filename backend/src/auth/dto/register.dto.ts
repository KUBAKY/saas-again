import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiProperty({
    description: '真实姓名',
    example: 'John Doe',
  })
  @IsString({ message: '真实姓名必须是字符串' })
  @IsNotEmpty({ message: '真实姓名不能为空' })
  realName: string;

  @ApiProperty({
    description: '手机号码',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '手机号码必须是字符串' })
  phone?: string;

  @ApiProperty({
    description: '品牌ID',
    example: 'uuid',
  })
  @IsUUID(4, { message: '品牌ID格式不正确' })
  @IsNotEmpty({ message: '品牌ID不能为空' })
  brandId: string;

  @ApiProperty({
    description: '门店ID',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: '门店ID格式不正确' })
  storeId?: string;
}

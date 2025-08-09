import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: '真实姓名', example: '张三', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  realName?: string;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  @Length(11, 11)
  phone?: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}
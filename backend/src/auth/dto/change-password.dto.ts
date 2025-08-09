import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码', example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: '密码至少需要8位字符' })
  newPassword: string;

  @ApiProperty({ description: '确认新密码', example: 'newPassword123' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
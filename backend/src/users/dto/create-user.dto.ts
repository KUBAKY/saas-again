import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEmail, 
  IsUUID, 
  IsArray,
  Length, 
  MinLength,
  IsIn 
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: '真实姓名', example: '约翰·多伊' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  realName: string;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  @Length(11, 11)
  phone?: string;

  @ApiProperty({ description: '品牌ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ 
    description: '门店ID', 
    example: '123e4567-e89b-12d3-a456-426614174001', 
    required: false 
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ 
    description: '用户状态', 
    example: 'active', 
    enum: ['active', 'inactive'], 
    default: 'active' 
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive' = 'active';

  @ApiProperty({ 
    description: '角色ID列表', 
    example: ['123e4567-e89b-12d3-a456-426614174002'],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  roleIds?: string[];

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '备注', example: '新员工', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
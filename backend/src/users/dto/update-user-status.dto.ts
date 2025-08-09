import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: '用户状态',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';

  @ApiProperty({
    description: '状态变更原因',
    example: '违规操作',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

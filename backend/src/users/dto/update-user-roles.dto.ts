import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdateUserRolesDto {
  @ApiProperty({ 
    description: '角色ID列表', 
    example: ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174003']
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  roleIds: string[];
}
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsString,
  IsUUID,
} from 'class-validator';

export class QueryCoachDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: '搜索关键字', example: '张教练' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '状态',
    example: 'active',
    enum: ['active', 'inactive', 'on_leave'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'on_leave'])
  status?: 'active' | 'inactive' | 'on_leave';

  @ApiPropertyOptional({
    description: '门店ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({
    description: '性别',
    example: 'male',
    enum: ['male', 'female'],
  })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: 'male' | 'female';

  @ApiPropertyOptional({ description: '专长', example: '力量训练' })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: '最少从业年限', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience?: number;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'createdAt',
    'updatedAt',
    'name',
    'employeeNumber',
    'hireDate',
    'experienceYears',
  ])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

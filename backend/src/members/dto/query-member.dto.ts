import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsIn, IsString, IsUUID } from 'class-validator';

export class QueryMemberDto {
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

  @ApiPropertyOptional({ description: '搜索关键字', example: '张三' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '状态', example: 'active', enum: ['active', 'inactive', 'suspended'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({ description: '门店ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiPropertyOptional({ description: '会员等级', example: 'gold', enum: ['bronze', 'silver', 'gold', 'platinum'] })
  @IsOptional()
  @IsIn(['bronze', 'silver', 'gold', 'platinum'])
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';

  @ApiPropertyOptional({ description: '性别', example: 'male', enum: ['male', 'female'] })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: 'male' | 'female';

  @ApiPropertyOptional({ description: '年龄范围-最小', example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(120)
  minAge?: number;

  @ApiPropertyOptional({ description: '年龄范围-最大', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(120)
  maxAge?: number;

  @ApiPropertyOptional({ description: '排序字段', example: 'createdAt', default: 'createdAt' })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'name', 'memberNumber', 'lastCheckInAt', 'points'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', example: 'DESC', default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
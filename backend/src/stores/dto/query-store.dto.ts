import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsIn, IsString, IsUUID } from 'class-validator';

export class QueryStoreDto {
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

  @ApiPropertyOptional({ description: '搜索关键字', example: '国贸' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '状态', example: 'active', enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({ description: '品牌ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: '城市', example: '北京' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '排序字段', example: 'createdAt', default: 'createdAt' })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'name', 'code'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', example: 'DESC', default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCourseDto {
  @ApiProperty({ required: false, description: '页码', default: 1 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({ required: false, description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({ required: false, description: '搜索关键字(课程名称)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    description: '课程类型',
    enum: ['personal', 'group', 'workshop'],
  })
  @IsOptional()
  @IsEnum(['personal', 'group', 'workshop'])
  type?: 'personal' | 'group' | 'workshop';

  @ApiProperty({
    required: false,
    description: '适合级别',
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'all'])
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';

  @ApiProperty({ required: false, description: '门店ID' })
  @IsOptional()
  @IsUUID()
  storeId?: string;

  @ApiProperty({ required: false, description: '教练ID' })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiProperty({
    required: false,
    description: '课程状态',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @ApiProperty({
    required: false,
    description: '排序字段',
    enum: ['name', 'type', 'price', 'rating', 'totalParticipants', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum(['name', 'type', 'price', 'rating', 'totalParticipants', 'createdAt'])
  sortBy?: string;

  @ApiProperty({
    required: false,
    description: '排序方向',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

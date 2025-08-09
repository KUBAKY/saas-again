import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ description: '课程名称', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '课程描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '课程类型', enum: ['personal', 'group', 'workshop'] })
  @IsEnum(['personal', 'group', 'workshop'])
  @IsNotEmpty()
  type: 'personal' | 'group' | 'workshop';

  @ApiProperty({ 
    description: '适合级别', 
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all' 
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'all'])
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';

  @ApiProperty({ description: '课程时长（分钟）', minimum: 15, maximum: 300 })
  @IsNumber()
  @Min(15)
  @Max(300)
  duration: number;

  @ApiProperty({ description: '最大参与人数', minimum: 1, maximum: 50 })
  @IsNumber()
  @Min(1)
  @Max(50)
  maxParticipants: number;

  @ApiProperty({ description: '课程价格', minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '课程封面图URL', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImage?: string;

  @ApiProperty({ description: '课程标签', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '所需器材', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @ApiProperty({ description: '注意事项', required: false })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({ description: '消耗卡路里（估算）', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesBurn?: number;

  @ApiProperty({ description: '门店ID' })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ description: '主要教练ID', required: false })
  @IsOptional()
  @IsUUID()
  coachId?: string;

  @ApiProperty({ description: '课程设置', required: false })
  @IsOptional()
  settings?: Record<string, any>;
}
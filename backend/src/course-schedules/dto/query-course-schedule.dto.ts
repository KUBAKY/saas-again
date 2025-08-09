import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryCourseScheduleDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  limit?: number = 20;

  @ApiProperty({ description: '搜索关键字', required: false })
  @IsOptional()
  @IsString({ message: '搜索关键字必须是字符串' })
  search?: string;

  @ApiProperty({ description: '排课状态', required: false })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  @IsIn(['scheduled', 'completed', 'cancelled'], { message: '状态值无效' })
  status?: 'scheduled' | 'completed' | 'cancelled';

  @ApiProperty({ description: '课程ID', required: false })
  @IsOptional()
  @IsString({ message: '课程ID必须是字符串' })
  courseId?: string;

  @ApiProperty({ description: '教练ID', required: false })
  @IsOptional()
  @IsString({ message: '教练ID必须是字符串' })
  coachId?: string;

  @ApiProperty({ description: '门店ID', required: false })
  @IsOptional()
  @IsString({ message: '门店ID必须是字符串' })
  storeId?: string;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  @ApiProperty({
    description: '排序字段',
    required: false,
    default: 'startTime',
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  @IsIn(['startTime', 'endTime', 'status', 'createdAt'], {
    message: '排序字段无效',
  })
  sortBy?: string = 'startTime';

  @ApiProperty({ description: '排序方向', required: false, default: 'ASC' })
  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  @IsIn(['ASC', 'DESC'], { message: '排序方向无效' })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

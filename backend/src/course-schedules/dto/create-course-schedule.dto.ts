import { IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseScheduleDto {
  @ApiProperty({ description: '课程ID' })
  @IsNotEmpty({ message: '课程ID不能为空' })
  @IsString({ message: '课程ID必须是字符串' })
  courseId: string;

  @ApiProperty({ description: '教练ID' })
  @IsNotEmpty({ message: '教练ID不能为空' })
  @IsString({ message: '教练ID必须是字符串' })
  coachId: string;

  @ApiProperty({ description: '门店ID' })
  @IsNotEmpty({ message: '门店ID不能为空' })
  @IsString({ message: '门店ID必须是字符串' })
  storeId: string;

  @ApiProperty({ description: '开始时间' })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsDateString({}, { message: '开始时间格式不正确' })
  startTime: Date;

  @ApiProperty({ description: '结束时间' })
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsDateString({}, { message: '结束时间格式不正确' })
  endTime: Date;

  @ApiProperty({ description: '最大参与人数' })
  @IsNotEmpty({ message: '最大参与人数不能为空' })
  @IsNumber({}, { message: '最大参与人数必须是数字' })
  @Min(1, { message: '最大参与人数不能少于1人' })
  @Max(50, { message: '最大参与人数不能超过50人' })
  maxParticipants: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  notes?: string;
}
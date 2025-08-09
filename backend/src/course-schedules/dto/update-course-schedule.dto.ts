import { PartialType } from '@nestjs/swagger';
import { CreateCourseScheduleDto } from './create-course-schedule.dto';

export class UpdateCourseScheduleDto extends PartialType(
  CreateCourseScheduleDto,
) {}

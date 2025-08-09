import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CourseSchedulesService } from './course-schedules.service';
import {
  CreateCourseScheduleDto,
  UpdateCourseScheduleDto,
  QueryCourseScheduleDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('课程排课管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('course-schedules')
export class CourseSchedulesController {
  constructor(
    private readonly courseSchedulesService: CourseSchedulesService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建课程排课' })
  @ApiResponse({ status: 201, description: '排课创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或时间冲突' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 409, description: '排课时间冲突' })
  create(
    @Body() createDto: CreateCourseScheduleDto,
    @CurrentUser() user: User,
  ) {
    return this.courseSchedulesService.create(createDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取排课列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '搜索关键字(课程名称/教练姓名)',
  })
  @ApiQuery({ name: 'status', required: false, description: '排课状态' })
  @ApiQuery({ name: 'courseId', required: false, description: '课程ID' })
  @ApiQuery({ name: 'coachId', required: false, description: '教练ID' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(
    @Query() queryDto: QueryCourseScheduleDto,
    @CurrentUser() user: User,
  ) {
    return this.courseSchedulesService.findAll(queryDto, user);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取排课统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@CurrentUser() user: User) {
    return this.courseSchedulesService.getStats(user);
  }

  @Get('calendar')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取日历视图排课数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'startDate', required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: true, description: '结束日期' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'coachId', required: false, description: '教练ID' })
  getCalendarSchedules(@Query() query: any, @CurrentUser() user: User) {
    return this.courseSchedulesService.getCalendarSchedules(query, user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取排课详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '排课不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.courseSchedulesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新排课信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '排课不存在' })
  @ApiResponse({ status: 409, description: '排课时间冲突' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCourseScheduleDto,
    @CurrentUser() user: User,
  ) {
    return this.courseSchedulesService.update(id, updateDto, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消排课' })
  @ApiResponse({ status: 200, description: '排课取消成功' })
  @ApiResponse({ status: 404, description: '排课不存在' })
  @ApiResponse({ status: 400, description: '排课无法取消' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() body: { reason?: string },
  ) {
    return this.courseSchedulesService.cancel(
      id,
      body.reason || '管理员取消',
      user,
    );
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: '完成排课' })
  @ApiResponse({ status: 200, description: '排课完成' })
  @ApiResponse({ status: 404, description: '排课不存在' })
  @ApiResponse({ status: 400, description: '排课状态无效' })
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.courseSchedulesService.complete(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除排课' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '排课不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.courseSchedulesService.remove(id, user);
  }
}

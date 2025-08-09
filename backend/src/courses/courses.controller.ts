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
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('课程管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: '创建课程' })
  @ApiResponse({ status: 201, description: '课程创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取课程列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键字(课程名称)' })
  @ApiQuery({ name: 'type', required: false, description: '课程类型' })
  @ApiQuery({ name: 'level', required: false, description: '适合级别' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'coachId', required: false, description: '教练ID' })
  @ApiQuery({ name: 'status', required: false, description: '状态过滤' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(@Query() queryDto: QueryCourseDto, @CurrentUser() user: User) {
    return this.coursesService.findAll(queryDto, user);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取课程统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@CurrentUser() user: User) {
    return this.coursesService.getStats(user);
  }

  @Get('popular')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取热门课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  getPopularCourses(@Query('limit') limit: string, @CurrentUser() user: User) {
    return this.coursesService.getPopularCourses(Number(limit) || 10, user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取课程详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coursesService.findOne(id, user);
  }

  @Get(':id/bookings')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取课程预约记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '预约状态' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  getCourseBookings(
    @Param('id') id: string,
    @Query() query: any,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.getCourseBookings(id, query, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新课程信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新课程状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'inactive' | 'suspended',
    @CurrentUser() user: User,
  ) {
    return this.coursesService.updateStatus(id, status, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除课程' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '课程不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coursesService.remove(id, user);
  }
}
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
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('预约管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: '创建预约' })
  @ApiResponse({ status: 201, description: '预约创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或时间冲突' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 409, description: '预约时间冲突' })
  create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.create(createBookingDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取预约列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键字(预约编号/会员姓名)' })
  @ApiQuery({ name: 'status', required: false, description: '预约状态' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiQuery({ name: 'coachId', required: false, description: '教练ID' })
  @ApiQuery({ name: 'courseId', required: false, description: '课程ID' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(@Query() queryDto: QueryBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.findAll(queryDto, user);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取预约统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@CurrentUser() user: User) {
    return this.bookingsService.getStats(user);
  }

  @Get('calendar')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取日历视图预约数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'startDate', required: true, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: true, description: '结束日期' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'coachId', required: false, description: '教练ID' })
  getCalendarBookings(@Query() query: any, @CurrentUser() user: User) {
    return this.bookingsService.getCalendarBookings(query, user);
  }

  @Get('conflicts')
  @ApiOperation({ summary: '检查预约时间冲突' })
  @ApiResponse({ status: 200, description: '检查完成' })
  @ApiQuery({ name: 'startTime', required: true, description: '开始时间' })
  @ApiQuery({ name: 'endTime', required: true, description: '结束时间' })
  @ApiQuery({ name: 'coachId', required: false, description: '教练ID' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiQuery({ name: 'excludeBookingId', required: false, description: '排除的预约ID' })
  checkConflicts(@Query() query: any, @CurrentUser() user: User) {
    return this.bookingsService.checkConflicts(query, user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取预约详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新预约信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 409, description: '预约时间冲突' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.update(id, updateBookingDto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: '更新预约状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 400, description: '状态转换无效' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
    @Body('reason') reason?: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.updateStatus(id, status, reason, user);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: '确认预约' })
  @ApiResponse({ status: 200, description: '预约确认成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 400, description: '预约状态无法确认' })
  confirm(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.confirm(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消预约' })
  @ApiResponse({ status: 200, description: '预约取消成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 400, description: '预约无法取消' })
  cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.cancel(id, reason, user);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: '完成预约' })
  @ApiResponse({ status: 200, description: '预约完成' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 400, description: '预约状态无效' })
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.complete(id, user);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: '添加预约评价' })
  @ApiResponse({ status: 200, description: '评价添加成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 400, description: '预约状态无效或已评价' })
  addReview(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('review') review?: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.addReview(id, rating, review, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除预约' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '预约不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.remove(id, user);
  }
}
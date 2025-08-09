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
import { CheckInsService } from './checkins.service';
import { CreateCheckInDto, UpdateCheckInDto, QueryCheckInDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('签到管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('checkins')
export class CheckInsController {
  constructor(private readonly checkInsService: CheckInsService) {}

  @Post()
  @ApiOperation({ summary: '创建签到记录' })
  @ApiResponse({ status: 201, description: '签到成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '重复签到' })
  create(
    @Body() createCheckInDto: CreateCheckInDto,
    @CurrentUser() user: User,
  ) {
    return this.checkInsService.create(createCheckInDto, user);
  }

  @Post('qr-code')
  @ApiOperation({ summary: '通过二维码签到' })
  @ApiResponse({ status: 201, description: '签到成功' })
  @ApiResponse({ status: 400, description: '二维码无效或过期' })
  checkInByQRCode(
    @Body('qrCode') qrCode: string,
    @Body('memberId') memberId: string,
    @CurrentUser() user: User,
  ) {
    return this.checkInsService.checkInByQRCode(qrCode, memberId, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取签到记录列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(@Query() queryDto: QueryCheckInDto, @CurrentUser() user: User) {
    return this.checkInsService.findAll(queryDto, user);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取签到统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@CurrentUser() user: User) {
    return this.checkInsService.getStats(user);
  }

  @Get('today')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取今日签到记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  getTodayCheckIns(
    @Query('storeId') storeId: string,
    @CurrentUser() user: User,
  ) {
    return this.checkInsService.getTodayCheckIns(storeId, user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取签到记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '签到记录不存在' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.checkInsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新签到记录' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '签到记录不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param('id') id: string,
    @Body() updateCheckInDto: UpdateCheckInDto,
    @CurrentUser() user: User,
  ) {
    return this.checkInsService.update(id, updateCheckInDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除签到记录' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '签到记录不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.checkInsService.remove(id, user);
  }
}

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
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto, QueryCoachDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('教练管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  @ApiOperation({ summary: '创建教练' })
  @ApiResponse({ status: 201, description: '教练创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '员工编号或手机号已存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(@Body() createCoachDto: CreateCoachDto, @CurrentUser() user: User) {
    return this.coachesService.create(createCoachDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取教练列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '搜索关键字(姓名/员工号)',
  })
  @ApiQuery({ name: 'status', required: false, description: '状态过滤' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  @ApiQuery({ name: 'gender', required: false, description: '性别' })
  @ApiQuery({ name: 'specialty', required: false, description: '专长' })
  @ApiQuery({
    name: 'minExperience',
    required: false,
    description: '最少从业年限',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(@Query() queryDto: QueryCoachDto, @CurrentUser() user: User) {
    return this.coachesService.findAll(queryDto, user);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取教练统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@CurrentUser() user: User) {
    return this.coachesService.getStats(user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取教练详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '教练不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coachesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新教练信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '教练不存在' })
  @ApiResponse({ status: 409, description: '手机号或邮箱已被使用' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param('id') id: string,
    @Body() updateCoachDto: UpdateCoachDto,
    @CurrentUser() user: User,
  ) {
    return this.coachesService.update(id, updateCoachDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除教练' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '教练不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.coachesService.remove(id, user);
  }
}

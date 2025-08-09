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
  ApiParam,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('门店管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: '创建门店' })
  @ApiResponse({ status: 201, description: '门店创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '门店编码已存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  create(@Body() createStoreDto: CreateStoreDto, @CurrentUser() user: User) {
    return this.storesService.create(createStoreDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取门店列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键字' })
  @ApiQuery({ name: 'status', required: false, description: '状态过滤' })
  @ApiQuery({ name: 'brandId', required: false, description: '品牌ID' })
  @ApiQuery({ name: 'city', required: false, description: '城市过滤' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(@Query() queryDto: QueryStoreDto, @CurrentUser() user: User) {
    return this.storesService.findAll(queryDto, user);
  }

  @Get('by-brand/:brandId')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '根据品牌ID获取门店列表' })
  @ApiParam({ name: 'brandId', description: '品牌ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findByBrand(@Param('brandId') brandId: string, @CurrentUser() user: User) {
    return this.storesService.findByBrand(brandId, user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取门店详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '门店不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.storesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新门店' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '门店不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @CurrentUser() user: User,
  ) {
    return this.storesService.update(id, updateStoreDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除门店' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '门店不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.storesService.remove(id, user);
  }

  @Get(':id/stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取门店统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '门店不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getStats(@Param('id') id: string, @CurrentUser() user: User) {
    return this.storesService.getStats(id, user);
  }
}
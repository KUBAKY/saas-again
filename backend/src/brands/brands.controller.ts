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
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto, QueryBrandDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('品牌管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: '创建品牌' })
  @ApiResponse({ status: 201, description: '品牌创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '品牌编码已存在' })
  create(@Body() createBrandDto: CreateBrandDto, @CurrentUser() user: User) {
    return this.brandsService.create(createBrandDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取品牌列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键字' })
  @ApiQuery({ name: 'status', required: false, description: '状态过滤' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  findAll(@Query() queryDto: QueryBrandDto, @CurrentUser() user: User) {
    return this.brandsService.findAll(queryDto, user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取品牌详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.brandsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新品牌' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @CurrentUser() user: User,
  ) {
    return this.brandsService.update(id, updateBrandDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除品牌' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.brandsService.remove(id, user);
  }

  @Get(':id/stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取品牌统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  getStats(@Param('id') id: string, @CurrentUser() user: User) {
    return this.brandsService.getStats(id, user);
  }
}

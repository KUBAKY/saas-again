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
import { MembershipCardsService } from './membership-cards.service';
import { CreateMembershipCardDto, UpdateMembershipCardDto, QueryMembershipCardDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('会员卡管理')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('membership-cards')
export class MembershipCardsController {
  constructor(private readonly membershipCardsService: MembershipCardsService) {}

  @Post()
  @ApiOperation({ summary: '创建会员卡' })
  @ApiResponse({ status: 201, description: '会员卡创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  create(@Body() createMembershipCardDto: CreateMembershipCardDto, @CurrentUser() user: User) {
    return this.membershipCardsService.create(createMembershipCardDto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取会员卡列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiQuery({ name: 'cardType', required: false, description: '卡类型' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'storeId', required: false, description: '门店ID' })
  findAll(@Query() queryDto: QueryMembershipCardDto, @CurrentUser() user: User) {
    return this.membershipCardsService.findAll(queryDto, user);
  }

  @Get('stats')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取会员卡统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  getStats(@CurrentUser() user: User) {
    return this.membershipCardsService.getStats(user);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '获取会员卡详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '会员卡不存在' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.membershipCardsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新会员卡信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '会员卡不存在' })
  update(
    @Param('id') id: string,
    @Body() updateMembershipCardDto: UpdateMembershipCardDto,
    @CurrentUser() user: User,
  ) {
    return this.membershipCardsService.update(id, updateMembershipCardDto, user);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: '激活会员卡' })
  @ApiResponse({ status: 200, description: '激活成功' })
  activate(@Param('id') id: string, @CurrentUser() user: User) {
    return this.membershipCardsService.activate(id, user);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: '暂停会员卡' })
  @ApiResponse({ status: 200, description: '暂停成功' })
  suspend(
    @Param('id') id: string,
    @Body('reason') reason?: string,
    @CurrentUser() user: User,
  ) {
    return this.membershipCardsService.suspend(id, reason, user);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: '续费会员卡' })
  @ApiResponse({ status: 200, description: '续费成功' })
  renew(
    @Param('id') id: string,
    @Body('renewalPeriod') renewalPeriod: number,
    @Body('amount') amount: number,
    @CurrentUser() user: User,
  ) {
    return this.membershipCardsService.renew(id, renewalPeriod, amount, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除会员卡' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '会员卡不存在' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.membershipCardsService.remove(id, user);
  }
}
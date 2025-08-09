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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupClassCardsService } from '../services/group-class-cards.service';
import { CreateGroupClassCardDto } from '../dto/create-group-class-card.dto';
import { UpdateGroupClassCardDto } from '../dto/update-group-class-card.dto';
import { QueryGroupClassCardDto } from '../dto/query-group-class-card.dto';

@ApiTags('团课卡管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('group-class-cards')
export class GroupClassCardsController {
  constructor(
    private readonly groupClassCardsService: GroupClassCardsService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建团课卡' })
  @ApiResponse({ status: 201, description: '团课卡创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '会员或会籍卡不存在' })
  async create(@Body() createDto: CreateGroupClassCardDto, @Request() req) {
    return await this.groupClassCardsService.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '获取团课卡列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryGroupClassCardDto, @Request() req) {
    return await this.groupClassCardsService.findAll(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取团课卡详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.groupClassCardsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新团课卡' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGroupClassCardDto,
    @Request() req,
  ) {
    return await this.groupClassCardsService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除团课卡' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.groupClassCardsService.remove(id, req.user);
    return { message: '删除成功' };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '激活团课卡' })
  @ApiResponse({ status: 200, description: '激活成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async activate(@Param('id') id: string, @Request() req) {
    return await this.groupClassCardsService.activate(id, req.user);
  }

  @Post(':id/freeze')
  @ApiOperation({ summary: '冻结团课卡' })
  @ApiResponse({ status: 200, description: '冻结成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async freeze(@Param('id') id: string, @Request() req) {
    return await this.groupClassCardsService.freeze(id, req.user);
  }

  @Post(':id/unfreeze')
  @ApiOperation({ summary: '解冻团课卡' })
  @ApiResponse({ status: 200, description: '解冻成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async unfreeze(@Param('id') id: string, @Request() req) {
    return await this.groupClassCardsService.unfreeze(id, req.user);
  }

  @Post(':id/use-session')
  @ApiOperation({ summary: '使用团课卡课时' })
  @ApiResponse({ status: 200, description: '使用成功' })
  @ApiResponse({ status: 400, description: '团课卡无法使用' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async useSession(@Param('id') id: string, @Request() req) {
    return await this.groupClassCardsService.useSession(id, req.user);
  }

  @Post(':id/expire')
  @ApiOperation({ summary: '设置团课卡过期' })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '团课卡不存在' })
  async expire(@Param('id') id: string, @Request() req) {
    return await this.groupClassCardsService.expire(id, req.user);
  }
}

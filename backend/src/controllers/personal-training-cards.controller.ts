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
import { PersonalTrainingCardsService } from '../services/personal-training-cards.service';
import { CreatePersonalTrainingCardDto } from '../dto/create-personal-training-card.dto';
import { UpdatePersonalTrainingCardDto } from '../dto/update-personal-training-card.dto';
import { QueryPersonalTrainingCardDto } from '../dto/query-personal-training-card.dto';

@ApiTags('私教卡管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('personal-training-cards')
export class PersonalTrainingCardsController {
  constructor(
    private readonly personalTrainingCardsService: PersonalTrainingCardsService,
  ) {}

  @Post()
  @ApiOperation({ summary: '创建私教卡' })
  @ApiResponse({ status: 201, description: '私教卡创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '会员、会籍卡或教练不存在' })
  async create(
    @Body() createDto: CreatePersonalTrainingCardDto,
    @Request() req,
  ) {
    return await this.personalTrainingCardsService.create(createDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '获取私教卡列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryPersonalTrainingCardDto, @Request() req) {
    return await this.personalTrainingCardsService.findAll(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取私教卡详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.personalTrainingCardsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新私教卡' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonalTrainingCardDto,
    @Request() req,
  ) {
    return await this.personalTrainingCardsService.update(
      id,
      updateDto,
      req.user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除私教卡' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.personalTrainingCardsService.remove(id, req.user);
    return { message: '删除成功' };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: '激活私教卡' })
  @ApiResponse({ status: 200, description: '激活成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async activate(@Param('id') id: string, @Request() req) {
    return await this.personalTrainingCardsService.activate(id, req.user);
  }

  @Post(':id/freeze')
  @ApiOperation({ summary: '冻结私教卡' })
  @ApiResponse({ status: 200, description: '冻结成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async freeze(@Param('id') id: string, @Request() req) {
    return await this.personalTrainingCardsService.freeze(id, req.user);
  }

  @Post(':id/unfreeze')
  @ApiOperation({ summary: '解冻私教卡' })
  @ApiResponse({ status: 200, description: '解冻成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async unfreeze(@Param('id') id: string, @Request() req) {
    return await this.personalTrainingCardsService.unfreeze(id, req.user);
  }

  @Post(':id/use-session')
  @ApiOperation({ summary: '使用私教卡课时' })
  @ApiResponse({ status: 200, description: '使用成功' })
  @ApiResponse({ status: 400, description: '私教卡无法使用' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async useSession(@Param('id') id: string, @Request() req) {
    return await this.personalTrainingCardsService.useSession(id, req.user);
  }

  @Post(':id/expire')
  @ApiOperation({ summary: '设置私教卡过期' })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '私教卡不存在' })
  async expire(@Param('id') id: string, @Request() req) {
    return await this.personalTrainingCardsService.expire(id, req.user);
  }
}

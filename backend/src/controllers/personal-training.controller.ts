import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  RequirePersonalTrainer,
  RequireSpecialization,
} from '../common/decorators/specialization.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Coach } from '../entities/coach.entity';

@ApiTags('私教业务')
@Controller('api/v1/personal-training')
@ApiBearerAuth()
export class PersonalTrainingController {
  @Post('bookings')
  @RequirePersonalTrainer()
  @ApiOperation({ summary: '创建私教预约' })
  @ApiResponse({ status: 201, description: '预约创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createBooking(
    @CurrentUser() user: User,
    @Request() req: any,
    @Body() createBookingDto: any,
  ) {
    const coach: Coach = req.coach; // 从守卫中获取教练信息

    // 验证教练是否可以管理私教业务
    if (!coach.canManagePersonalTraining()) {
      throw new Error('教练无权限管理私教业务');
    }

    return {
      message: '私教预约创建成功',
      coachId: coach.id,
      coachName: coach.name,
      specializationType: coach.specializationType,
    };
  }

  @Get('my-sessions')
  @RequirePersonalTrainer()
  @ApiOperation({ summary: '获取我的私教课程' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMySessions(
    @CurrentUser() user: User,
    @Request() req: any,
    @Query('status') status?: string,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '获取私教课程成功',
      coachId: coach.id,
      sessions: [], // 实际业务逻辑中从数据库获取
      filter: { status },
    };
  }

  @Patch('sessions/:id/complete')
  @RequirePersonalTrainer()
  @ApiOperation({ summary: '完成私教课程' })
  @ApiParam({ name: 'id', description: '课程ID' })
  @ApiResponse({ status: 200, description: '课程完成' })
  async completeSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '私教课程已完成',
      sessionId,
      coachId: coach.id,
      completedAt: new Date(),
    };
  }

  @Get('cards')
  @RequireSpecialization('personal')
  @ApiOperation({ summary: '获取私教卡列表' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPersonalTrainingCards(
    @Query('memberId') memberId?: string,
    @Request() req?: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '获取私教卡列表成功',
      coachId: coach.id,
      cards: [], // 实际业务逻辑中从数据库获取
      filter: { memberId },
    };
  }

  @Post('cards/:id/use')
  @RequirePersonalTrainer()
  @ApiOperation({ summary: '使用私教卡' })
  @ApiParam({ name: 'id', description: '私教卡ID' })
  @ApiResponse({ status: 200, description: '使用成功' })
  async usePersonalTrainingCard(
    @Param('id') cardId: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '私教卡使用成功',
      cardId,
      coachId: coach.id,
      usedAt: new Date(),
    };
  }
}

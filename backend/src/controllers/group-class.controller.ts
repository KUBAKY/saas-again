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
  RequireGroupInstructor,
  RequireSpecialization,
} from '../common/decorators/specialization.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { Coach } from '../entities/coach.entity';

@ApiTags('团课业务')
@Controller('api/v1/group-class')
@ApiBearerAuth()
export class GroupClassController {
  @Post('schedules')
  @RequireGroupInstructor()
  @ApiOperation({ summary: '创建团课排期' })
  @ApiResponse({ status: 201, description: '排期创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createSchedule(
    @CurrentUser() user: User,
    @Request() req: any,
    @Body() createScheduleDto: any,
  ) {
    const coach: Coach = req.coach; // 从守卫中获取教练信息

    // 验证教练是否可以管理团课业务
    if (!coach.canManageGroupClass()) {
      throw new Error('教练无权限管理团课业务');
    }

    // 检查最大学员数限制
    const maxStudents = coach.getMaxStudentsPerClass();
    if (createScheduleDto.maxStudents > maxStudents) {
      throw new Error(`超出最大学员数限制: ${maxStudents}`);
    }

    return {
      message: '团课排期创建成功',
      coachId: coach.id,
      coachName: coach.name,
      specializationType: coach.specializationType,
      maxStudents,
    };
  }

  @Get('my-classes')
  @RequireGroupInstructor()
  @ApiOperation({ summary: '获取我的团课' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyClasses(
    @CurrentUser() user: User,
    @Request() req: any,
    @Query('date') date?: string,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '获取团课列表成功',
      coachId: coach.id,
      classes: [], // 实际业务逻辑中从数据库获取
      filter: { date },
      maxStudentsPerClass: coach.getMaxStudentsPerClass(),
    };
  }

  @Patch('classes/:id/start')
  @RequireGroupInstructor()
  @ApiOperation({ summary: '开始团课' })
  @ApiParam({ name: 'id', description: '团课ID' })
  @ApiResponse({ status: 200, description: '团课已开始' })
  async startClass(
    @Param('id') classId: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '团课已开始',
      classId,
      coachId: coach.id,
      startedAt: new Date(),
    };
  }

  @Post('classes/:id/checkin')
  @RequireGroupInstructor()
  @ApiOperation({ summary: '团课签到' })
  @ApiParam({ name: 'id', description: '团课ID' })
  @ApiResponse({ status: 200, description: '签到成功' })
  async checkinMember(
    @Param('id') classId: string,
    @Body() checkinDto: { memberId: string },
    @CurrentUser() user: User,
    @Request() req: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '会员签到成功',
      classId,
      memberId: checkinDto.memberId,
      coachId: coach.id,
      checkinAt: new Date(),
    };
  }

  @Get('cards')
  @RequireSpecialization('group')
  @ApiOperation({ summary: '获取团课卡列表' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getGroupClassCards(
    @Query('memberId') memberId?: string,
    @Request() req?: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '获取团课卡列表成功',
      coachId: coach.id,
      cards: [], // 实际业务逻辑中从数据库获取
      filter: { memberId },
    };
  }

  @Post('cards/:id/use')
  @RequireGroupInstructor()
  @ApiOperation({ summary: '使用团课卡' })
  @ApiParam({ name: 'id', description: '团课卡ID' })
  @ApiResponse({ status: 200, description: '使用成功' })
  async useGroupClassCard(
    @Param('id') cardId: string,
    @CurrentUser() user: User,
    @Request() req: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '团课卡使用成功',
      cardId,
      coachId: coach.id,
      usedAt: new Date(),
    };
  }

  @Get('statistics')
  @RequireGroupInstructor()
  @ApiOperation({ summary: '获取团课统计数据' })
  @ApiQuery({ name: 'period', required: false, description: '统计周期' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(
    @Query('period') period: string = 'month',
    @Request() req: any,
  ) {
    const coach: Coach = req.coach;

    return {
      message: '获取团课统计成功',
      coachId: coach.id,
      period,
      statistics: {
        totalClasses: 0,
        totalStudents: 0,
        averageAttendance: 0,
        maxStudentsPerClass: coach.getMaxStudentsPerClass(),
      },
    };
  }
}

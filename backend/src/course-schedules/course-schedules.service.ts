import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { Course } from '../entities/course.entity';
import { Coach } from '../entities/coach.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import {
  CreateCourseScheduleDto,
  UpdateCourseScheduleDto,
  QueryCourseScheduleDto,
} from './dto';

@Injectable()
export class CourseSchedulesService {
  constructor(
    @InjectRepository(CourseSchedule)
    private readonly courseScheduleRepository: Repository<CourseSchedule>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  /**
   * 创建课程排课
   */
  async create(
    createDto: CreateCourseScheduleDto,
    user: User,
  ): Promise<CourseSchedule> {
    // 验证课程是否存在
    const course = await this.courseRepository.findOne({
      where: { id: createDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 验证教练是否存在
    const coach = await this.coachRepository.findOne({
      where: { id: createDto.coachId },
    });
    if (!coach) {
      throw new NotFoundException('教练不存在');
    }

    // 验证门店是否存在
    const store = await this.storeRepository.findOne({
      where: { id: createDto.storeId },
    });
    if (!store) {
      throw new NotFoundException('门店不存在');
    }

    // 检查时间冲突
    await this.checkTimeConflict(
      createDto.startTime,
      createDto.endTime,
      createDto.coachId,
      createDto.storeId,
    );

    // 验证时间合理性
    const startTime = new Date(createDto.startTime);
    const endTime = new Date(createDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('开始时间必须早于结束时间');
    }

    if (startTime <= new Date()) {
      throw new BadRequestException('开始时间必须晚于当前时间');
    }

    const schedule = this.courseScheduleRepository.create({
      ...createDto,
      currentParticipants: 0,
      status: 'scheduled',
    });

    return await this.courseScheduleRepository.save(schedule);
  }

  /**
   * 获取排课列表
   */
  async findAll(queryDto: QueryCourseScheduleDto, user: User) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      courseId,
      coachId,
      storeId,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'ASC',
    } = queryDto;

    const queryBuilder = this.createBaseQuery(user);

    // 搜索条件
    if (search) {
      queryBuilder.andWhere(
        '(course.name LIKE :search OR coach.name LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 状态过滤
    if (status) {
      queryBuilder.andWhere('schedule.status = :status', { status });
    }

    // 课程过滤
    if (courseId) {
      queryBuilder.andWhere('schedule.courseId = :courseId', { courseId });
    }

    // 教练过滤
    if (coachId) {
      queryBuilder.andWhere('schedule.coachId = :coachId', { coachId });
    }

    // 门店过滤
    if (storeId) {
      queryBuilder.andWhere('schedule.storeId = :storeId', { storeId });
    }

    // 日期范围过滤
    if (startDate && endDate) {
      queryBuilder.andWhere(
        'schedule.startTime BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('schedule.startTime >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('schedule.startTime <= :endDate', { endDate });
    }

    // 排序
    const validSortFields = ['startTime', 'endTime', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
    queryBuilder.orderBy(
      `schedule.${sortField}`,
      sortOrder === 'DESC' ? 'DESC' : 'ASC',
    );

    // 分页
    const total = await queryBuilder.getCount();
    const schedules = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: schedules,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取排课详情
   */
  async findOne(id: string, user: User): Promise<CourseSchedule> {
    const schedule = await this.courseScheduleRepository.findOne({
      where: { id },
      relations: ['course', 'coach', 'store', 'bookings'],
    });

    if (!schedule) {
      throw new NotFoundException('排课不存在');
    }

    // 数据隔离检查
    if (!user.hasRole('ADMIN') && !user.hasRole('SUPER_ADMIN')) {
      if (user.hasRole('STORE_MANAGER') && schedule.storeId !== user.storeId) {
        throw new ForbiddenException('无权访问其他门店的排课');
      }
      if (user.hasRole('COACH') && schedule.coachId !== user.id) {
        throw new ForbiddenException('无权访问其他教练的排课');
      }
    }

    return schedule;
  }

  /**
   * 更新排课信息
   */
  async update(
    id: string,
    updateDto: UpdateCourseScheduleDto,
    user: User,
  ): Promise<CourseSchedule> {
    const schedule = await this.findOne(id, user);

    // 检查是否可以修改
    if (schedule.status === 'completed' || schedule.status === 'cancelled') {
      throw new BadRequestException('已完成或已取消的排课不能修改');
    }

    // 如果修改了时间，需要检查冲突
    if (updateDto.startTime || updateDto.endTime) {
      const startTime = updateDto.startTime
        ? new Date(updateDto.startTime)
        : schedule.startTime;
      const endTime = updateDto.endTime
        ? new Date(updateDto.endTime)
        : schedule.endTime;

      if (startTime >= endTime) {
        throw new BadRequestException('开始时间必须早于结束时间');
      }

      await this.checkTimeConflict(
        startTime,
        endTime,
        updateDto.coachId || schedule.coachId,
        updateDto.storeId || schedule.storeId,
        id,
      );
    }

    Object.assign(schedule, updateDto);
    schedule.updatedAt = new Date();

    return await this.courseScheduleRepository.save(schedule);
  }

  /**
   * 取消排课
   */
  async cancel(
    id: string,
    reason: string,
    user: User,
  ): Promise<CourseSchedule> {
    const schedule = await this.findOne(id, user);

    if (!schedule.canCancel()) {
      throw new BadRequestException(
        '排课无法取消（可能已开始或开始前3小时内）',
      );
    }

    schedule.cancel(reason);
    schedule.updatedAt = new Date();

    return await this.courseScheduleRepository.save(schedule);
  }

  /**
   * 完成排课
   */
  async complete(id: string, user: User): Promise<CourseSchedule> {
    const schedule = await this.findOne(id, user);

    if (schedule.status !== 'scheduled') {
      throw new BadRequestException('只有已安排的排课才能标记为完成');
    }

    schedule.complete();
    schedule.updatedAt = new Date();

    return await this.courseScheduleRepository.save(schedule);
  }

  /**
   * 删除排课
   */
  async remove(id: string, user: User): Promise<void> {
    const schedule = await this.findOne(id, user);

    if (schedule.currentParticipants > 0) {
      throw new BadRequestException('有预约的排课不能删除');
    }

    schedule.deletedAt = new Date();
    await this.courseScheduleRepository.save(schedule);
  }

  /**
   * 获取排课统计
   */
  async getStats(user: User) {
    const queryBuilder = this.createBaseQuery(user);

    const [total, scheduled, completed, cancelled] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('schedule.status = :status', { status: 'scheduled' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('schedule.status = :status', { status: 'completed' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('schedule.status = :status', { status: 'cancelled' })
        .getCount(),
    ]);

    // 今日排课数量
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayCount = await queryBuilder
      .clone()
      .andWhere('schedule.startTime BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      })
      .getCount();

    return {
      total,
      scheduled,
      completed,
      cancelled,
      today: todayCount,
    };
  }

  /**
   * 获取日历视图排课数据
   */
  async getCalendarSchedules(query: any, user: User) {
    const { startDate, endDate, storeId, coachId } = query;

    const queryBuilder = this.createBaseQuery(user);

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'schedule.startTime BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    if (storeId) {
      queryBuilder.andWhere('schedule.storeId = :storeId', { storeId });
    }

    if (coachId) {
      queryBuilder.andWhere('schedule.coachId = :coachId', { coachId });
    }

    queryBuilder.orderBy('schedule.startTime', 'ASC');

    const schedules = await queryBuilder.getMany();

    return schedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.course.name,
      start: schedule.startTime,
      end: schedule.endTime,
      status: schedule.status,
      coach: schedule.coach.name,
      store: schedule.store.name,
      participants: `${schedule.currentParticipants}/${schedule.maxParticipants}`,
      color: this.getStatusColor(schedule.status),
    }));
  }

  /**
   * 检查时间冲突
   */
  private async checkTimeConflict(
    startTime: Date,
    endTime: Date,
    coachId: string,
    storeId: string,
    excludeId?: string,
  ): Promise<void> {
    const queryBuilder = this.courseScheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.coachId = :coachId', { coachId })
      .andWhere('schedule.status = :status', { status: 'scheduled' })
      .andWhere(
        '(schedule.startTime < :endTime AND schedule.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeId) {
      queryBuilder.andWhere('schedule.id != :excludeId', { excludeId });
    }

    const conflictingSchedule = await queryBuilder.getOne();

    if (conflictingSchedule) {
      throw new ConflictException('教练在该时间段已有其他排课');
    }
  }

  /**
   * 创建基础查询
   */
  private createBaseQuery(user: User): SelectQueryBuilder<CourseSchedule> {
    const queryBuilder = this.courseScheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('schedule.coach', 'coach')
      .leftJoinAndSelect('schedule.store', 'store')
      .where('schedule.deletedAt IS NULL');

    // 数据隔离
    if (user.hasRole('STORE_MANAGER')) {
      queryBuilder.andWhere('schedule.storeId = :storeId', {
        storeId: user.storeId,
      });
    } else if (user.hasRole('COACH')) {
      queryBuilder.andWhere('schedule.coachId = :coachId', {
        coachId: user.id,
      });
    }

    return queryBuilder;
  }

  /**
   * 根据状态获取颜色
   */
  private getStatusColor(status: string): string {
    const colorMap = {
      scheduled: '#1890ff',
      completed: '#52c41a',
      cancelled: '#ff4d4f',
    };
    return colorMap[status] || '#d9d9d9';
  }
}

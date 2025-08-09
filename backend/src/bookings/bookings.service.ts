import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  SelectQueryBuilder,
  Between,
  LessThan,
  MoreThan,
  IsNull,
} from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { Course } from '../entities/course.entity';
import { Member } from '../entities/member.entity';
import { Coach } from '../entities/coach.entity';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';
import { checkPermission } from '../common/utils/permission.util';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(CourseSchedule)
    private readonly courseScheduleRepository: Repository<CourseSchedule>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    user: User,
  ): Promise<Booking> {
    // 生成预约编号
    const bookingNumber = await this.generateBookingNumber();

    // 检查时间冲突
    await this.validateBookingTime(createBookingDto, user);

    // 数据隔离：根据用户角色确定门店ID
    let storeId = createBookingDto.storeId;
    if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
      storeId = user.storeId;
    }

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      bookingNumber,
      storeId,
      status: 'pending',
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(queryDto: QueryBookingDto, user: User) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      memberId,
      coachId,
      courseId,
      storeId,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.createBaseQuery(user);

    // 搜索过滤
    if (search) {
      queryBuilder.andWhere(
        '(booking.bookingNumber ILIKE :search OR member.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 状态过滤
    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    // 会员过滤
    if (memberId) {
      queryBuilder.andWhere('booking.memberId = :memberId', { memberId });
    }

    // 教练过滤
    if (coachId) {
      queryBuilder.andWhere('booking.coachId = :coachId', { coachId });
    }

    // 课程过滤
    if (courseId) {
      queryBuilder.andWhere('booking.courseId = :courseId', { courseId });
    }

    // 门店过滤
    if (storeId) {
      queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
    }

    // 日期范围过滤
    if (startDate) {
      queryBuilder.andWhere('booking.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('booking.startTime <= :endDate', { endDate });
    }

    // 排序
    const validSortFields = [
      'bookingNumber',
      'startTime',
      'endTime',
      'status',
      'createdAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
    queryBuilder.orderBy(
      `booking.${sortField}`,
      sortOrder === 'ASC' ? 'ASC' : 'DESC',
    );

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<Booking> {
    const queryBuilder = this.createBaseQuery(user);
    queryBuilder.andWhere('booking.id = :id', { id });

    const booking = await queryBuilder.getOne();

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    user: User,
  ): Promise<Booking> {
    const booking = await this.findOne(id, user);

    // 权限检查
    this.checkUpdatePermission(booking, user);

    // 如果更新时间，需要检查冲突
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      await this.validateBookingTime(
        {
          ...updateBookingDto,
          startTime: updateBookingDto.startTime || booking.startTime,
          endTime: updateBookingDto.endTime || booking.endTime,
          coachId: updateBookingDto.coachId || booking.coachId,
          memberId: booking.memberId,
          courseId: updateBookingDto.courseId || booking.courseId,
          storeId: booking.storeId,
        },
        user || ({ storeId: booking.storeId } as User),
        id,
      );
    }

    Object.assign(booking, updateBookingDto);
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
    reason?: string,
    user?: User,
  ): Promise<Booking> {
    if (!user) {
      throw new UnauthorizedException('用户信息不能为空');
    }
    const booking = await this.findOne(id, user);

    // 验证状态转换
    this.validateStatusTransition(booking.status, status);

    booking.status = status;
    booking.updatedAt = new Date();

    if (status === 'cancelled') {
      booking.cancelledAt = new Date();
      booking.cancellationReason = reason;
    }

    return await this.bookingRepository.save(booking);
  }

  async confirm(id: string, user: User): Promise<Booking> {
    const booking = await this.findOne(id, user);

    if (booking.status !== 'pending') {
      throw new BadRequestException('只有待确认的预约才能被确认');
    }

    booking.confirm();
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  async cancel(id: string, reason?: string, user?: User): Promise<Booking> {
    if (!user) {
      throw new UnauthorizedException('用户信息不能为空');
    }
    const booking = await this.findOne(id, user);

    if (!booking.isCancellable()) {
      throw new BadRequestException(
        '预约无法取消（可能已开始或开始前2小时内）',
      );
    }

    const success = booking.cancel(reason);
    if (!success) {
      throw new BadRequestException('预约取消失败');
    }

    booking.updatedAt = new Date();
    return await this.bookingRepository.save(booking);
  }

  async complete(id: string, user: User): Promise<Booking> {
    const booking = await this.findOne(id, user);

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('只有已确认的预约才能标记为完成');
    }

    if (!booking.isPast()) {
      throw new BadRequestException('只有已结束的预约才能标记为完成');
    }

    booking.complete();
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  async addReview(
    id: string,
    rating: number,
    review?: string,
    user?: User,
  ): Promise<Booking> {
    if (!user) {
      throw new UnauthorizedException('用户信息不能为空');
    }
    const booking = await this.findOne(id, user);

    if (booking.status !== 'completed') {
      throw new BadRequestException('只有已完成的预约才能评价');
    }

    if (booking.hasReview()) {
      throw new BadRequestException('该预约已经评价过了');
    }

    booking.addReview(rating, review);
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const booking = await this.findOne(id, user);

    // 权限检查
    const userRole = user.roles?.[0]?.name || '';
    if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
      throw new ForbiddenException('权限不足，无法删除预约');
    }

    booking.deletedAt = new Date();
    await this.bookingRepository.save(booking);

    return { message: '预约删除成功' };
  }

  async getStats(user: User) {
    const queryBuilder = this.createBaseQuery(
      user || ({ storeId: '' } as User),
      false,
    );

    const [total, pending, confirmed, cancelled, completed, noShow] =
      await Promise.all([
        queryBuilder.clone().getCount(),
        queryBuilder
          .clone()
          .andWhere('booking.status = :status', { status: 'pending' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('booking.status = :status', { status: 'confirmed' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('booking.status = :status', { status: 'cancelled' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('booking.status = :status', { status: 'completed' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('booking.status = :status', { status: 'no_show' })
          .getCount(),
      ]);

    // 获取今日预约
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await queryBuilder
      .clone()
      .andWhere('booking.startTime >= :today', { today })
      .andWhere('booking.startTime < :tomorrow', { tomorrow })
      .getCount();

    return {
      total,
      byStatus: {
        pending,
        confirmed,
        cancelled,
        completed,
        noShow,
      },
      todayBookings,
    };
  }

  async getCalendarBookings(query: any, user: User) {
    const { startDate, endDate, storeId, coachId } = query;

    const queryBuilder = this.createBaseQuery(user);

    queryBuilder
      .andWhere('booking.startTime >= :startDate', { startDate })
      .andWhere('booking.startTime <= :endDate', { endDate });

    if (storeId) {
      queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
    }

    if (coachId) {
      queryBuilder.andWhere('booking.coachId = :coachId', { coachId });
    }

    queryBuilder.orderBy('booking.startTime', 'ASC');

    const bookings = await queryBuilder.getMany();

    // 转换为日历格式
    return bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.course.name} - ${booking.member.name}`,
      start: booking.startTime,
      end: booking.endTime,
      status: booking.status,
      member: booking.member.name,
      coach: booking.coach?.name,
      course: booking.course.name,
      color: this.getStatusColor(booking.status),
    }));
  }

  async checkConflicts(query: any, user: User) {
    const {
      startTime,
      endTime,
      coachId,
      memberId,
      excludeBookingId,
      courseId,
      storeId,
    } = query;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.course', 'course')
      .leftJoinAndSelect('booking.coach', 'coach')
      .leftJoinAndSelect('booking.member', 'member')
      .where('booking.status IN (:...statuses)', {
        statuses: ['pending', 'confirmed'],
      })
      .andWhere('booking.deletedAt IS NULL')
      .andWhere(
        '(booking.startTime < :endTime AND booking.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeBookingId', {
        excludeBookingId,
      });
    }

    // 门店数据隔离
    if (storeId) {
      queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
    }

    // 检查教练冲突
    let coachConflicts: Booking[] = [];
    if (coachId) {
      const coachQuery = queryBuilder
        .clone()
        .andWhere('booking.coachId = :coachId', { coachId });
      coachConflicts = await coachQuery.getMany();
    }

    // 检查会员冲突（私教课程）
    let memberConflicts: Booking[] = [];
    if (memberId) {
      const memberQuery = queryBuilder
        .clone()
        .andWhere('booking.memberId = :memberId', { memberId })
        .andWhere('course.type = :courseType', { courseType: 'personal' });
      memberConflicts = await memberQuery.getMany();
    }

    // 检查课程容量冲突（团课）
    let capacityConflicts: Booking[] = [];
    if (courseId) {
      const capacityQuery = this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.course', 'course')
        .where('booking.courseId = :courseId', { courseId })
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['pending', 'confirmed'],
        })
        .andWhere('booking.deletedAt IS NULL')
        .andWhere(
          '(booking.startTime < :endTime AND booking.endTime > :startTime)',
          { startTime, endTime },
        );

      if (excludeBookingId) {
        capacityQuery.andWhere('booking.id != :excludeBookingId', {
          excludeBookingId,
        });
      }

      capacityConflicts = await capacityQuery.getMany();
    }

    // 分析冲突类型
    const conflictTypes: string[] = [];
    if (coachConflicts.length > 0) {
      conflictTypes.push('coach_busy');
    }
    if (memberConflicts.length > 0) {
      conflictTypes.push('member_busy');
    }
    if (capacityConflicts.length > 0) {
      conflictTypes.push('course_full');
    }

    return {
      hasConflicts:
        coachConflicts.length > 0 ||
        memberConflicts.length > 0 ||
        capacityConflicts.length > 0,
      conflictTypes,
      coachConflicts,
      memberConflicts,
      capacityConflicts,
      details: {
        coachConflictCount: coachConflicts.length,
        memberConflictCount: memberConflicts.length,
        capacityConflictCount: capacityConflicts.length,
      },
    };
  }

  private createBaseQuery(
    user: User,
    withRelations: boolean = true,
  ): SelectQueryBuilder<Booking> {
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking');

    if (withRelations) {
      queryBuilder
        .leftJoinAndSelect('booking.member', 'member')
        .leftJoinAndSelect('booking.coach', 'coach')
        .leftJoinAndSelect('booking.course', 'course')
        .leftJoinAndSelect('booking.store', 'store');
    }

    // 数据隔离
    if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
      queryBuilder.andWhere('booking.storeId = :storeId', {
        storeId: user.storeId,
      });
    } else if (user.roles?.[0]?.name === 'BRAND_MANAGER' && user.brandId) {
      queryBuilder
        .leftJoin('booking.store', 'filterStore')
        .andWhere('filterStore.brandId = :brandId', { brandId: user.brandId });
    }

    // 排除软删除的记录
    queryBuilder.andWhere('booking.deletedAt IS NULL');

    return queryBuilder;
  }

  private async generateBookingNumber(): Promise<string> {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private async validateBookingTime(
    bookingData: any,
    user: User,
    excludeId?: string,
  ) {
    const conflicts = await this.checkConflicts(
      {
        ...bookingData,
        excludeBookingId: excludeId,
      },
      user || ({ storeId: '' } as User),
    );

    if (conflicts.hasConflicts) {
      throw new ConflictException('预约时间冲突');
    }
  }

  private checkUpdatePermission(booking: Booking, user: User) {
    const userRole = user.roles?.[0]?.name || '';

    // 管理员和品牌管理员可以修改所有预约
    if (['ADMIN', 'BRAND_MANAGER'].includes(userRole)) {
      return;
    }

    // 门店管理员只能修改自己门店的预约
    if (userRole === 'STORE_MANAGER') {
      if (booking.storeId !== user.storeId) {
        throw new ForbiddenException('权限不足，只能修改自己门店的预约');
      }
      return;
    }

    throw new ForbiddenException('权限不足，无法修改预约');
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'no_show'],
      cancelled: [],
      completed: [],
      no_show: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `无法从状态 ${currentStatus} 转换到 ${newStatus}`,
      );
    }
  }

  private getStatusColor(status: string): string {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      cancelled: '#e74c3c',
      completed: '#3498db',
      no_show: '#95a5a6',
      charged: '#2980b9',
      checked_in: '#16a085',
    };

    return colors[status] || '#95a5a6';
  }

  // 新增业务方法

  /**
   * 自动扣费 - 课程开始前3小时自动扣费
   */
  async processAutoCharging(): Promise<{ processed: number; failed: number }> {
    const threeHoursFromNow = new Date();
    threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);

    // 查找需要扣费的预约
    const bookingsToCharge = await this.bookingRepository.find({
      where: {
        status: 'confirmed',
        startTime: LessThan(threeHoursFromNow),
        deletedAt: IsNull(),
      },
      relations: ['member', 'course', 'store'],
    });

    let processed = 0;
    let failed = 0;

    for (const booking of bookingsToCharge) {
      try {
        if (booking.needsCharging()) {
          booking.charge();
          await this.bookingRepository.save(booking);
          processed++;
        }
      } catch (error) {
        console.error(`扣费失败 - 预约ID: ${booking.id}`, error);
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * 会员签到
   */
  async checkIn(bookingId: string, user: User): Promise<Booking> {
    if (!user) {
      throw new BadRequestException('用户信息不能为空');
    }
    if (!user) {
      throw new BadRequestException('用户信息不能为空');
    }
    if (!user) {
      throw new BadRequestException('用户信息不能为空');
    }
    const booking = await this.findOne(bookingId, user);

    if (!booking.isCharged()) {
      throw new BadRequestException('只有已扣费的预约才能签到');
    }

    if (booking.isCheckedIn()) {
      throw new BadRequestException('该预约已经签到过了');
    }

    // 检查签到时间（课程开始前30分钟到课程结束后30分钟内可以签到）
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const thirtyMinutesBefore = new Date(startTime.getTime() - 30 * 60 * 1000);
    const thirtyMinutesAfter = new Date(endTime.getTime() + 30 * 60 * 1000);

    if (now < thirtyMinutesBefore || now > thirtyMinutesAfter) {
      throw new BadRequestException('不在签到时间范围内');
    }

    booking.checkIn();
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  /**
   * 标记课程完成
   */
  async markCompleted(bookingId: string, user: User): Promise<Booking> {
    const booking = await this.findOne(bookingId, user);

    if (!booking.isCheckedIn()) {
      throw new BadRequestException('只有已签到的预约才能标记为完成');
    }

    booking.complete();
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  /**
   * 标记未到课
   */
  async markNoShow(bookingId: string, user: User): Promise<Booking> {
    const booking = await this.findOne(bookingId, user);

    if (!booking.isCharged()) {
      throw new BadRequestException('只有已扣费的预约才能标记为未到课');
    }

    if (booking.isCheckedIn()) {
      throw new BadRequestException('已签到的预约不能标记为未到课');
    }

    // 检查是否已过课程结束时间
    const now = new Date();
    const endTime = new Date(booking.endTime);

    if (now <= endTime) {
      throw new BadRequestException('课程尚未结束，不能标记为未到课');
    }

    booking.markNoShow();
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  /**
   * 创建团课预约（基于排课）
   */
  async createGroupClassBooking(
    scheduleId: string,
    memberId: string,
    user: User,
  ): Promise<Booking> {
    const schedule = await this.courseScheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['course', 'coach', 'store'],
    });

    if (!schedule) {
      throw new NotFoundException('排课不存在');
    }

    if (!schedule.isAvailable()) {
      throw new BadRequestException('该排课不可预约');
    }

    if (schedule.isFull()) {
      throw new BadRequestException('该排课已满员');
    }

    // 检查会员是否已预约该排课
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        courseScheduleId: scheduleId,
        memberId,
        status: 'confirmed',
        deletedAt: IsNull(),
      },
    });

    if (existingBooking) {
      throw new ConflictException('您已预约该课程');
    }

    // 生成预约编号
    const bookingNumber = await this.generateBookingNumber();

    const booking = this.bookingRepository.create({
      bookingNumber,
      memberId,
      coachId: schedule.coachId,
      courseId: schedule.courseId,
      storeId: schedule.storeId,
      courseScheduleId: scheduleId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: 'confirmed',
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // 更新排课参与人数
    schedule.addParticipant();
    await this.courseScheduleRepository.save(schedule);

    return savedBooking;
  }

  /**
   * 取消团课预约
   */
  async cancelGroupClassBooking(
    bookingId: string,
    reason?: string,
    user?: User,
  ): Promise<Booking> {
    if (!user) {
      throw new UnauthorizedException('用户信息不能为空');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['courseSchedule'],
    });

    if (!booking) {
      throw new NotFoundException('预约不存在');
    }

    if (!booking.isCancellable()) {
      throw new BadRequestException(
        '预约无法取消（可能已开始或开始前3小时内）',
      );
    }

    const success = booking.cancel(reason);
    if (!success) {
      throw new BadRequestException('预约取消失败');
    }

    booking.updatedAt = new Date();
    const savedBooking = await this.bookingRepository.save(booking);

    // 如果是团课预约，更新排课参与人数
    if (booking.courseSchedule) {
      booking.courseSchedule.removeParticipant();
      await this.courseScheduleRepository.save(booking.courseSchedule);
    }

    return savedBooking;
  }

  /**
   * 获取会员的预约历史
   */
  async getMemberBookings(
    memberId: string,
    queryDto: QueryBookingDto,
    user: User,
  ) {
    const queryBuilder = this.createBaseQuery(user);
    queryBuilder.andWhere('booking.memberId = :memberId', { memberId });

    // 应用其他过滤条件
    const {
      status,
      startDate,
      endDate,
      sortBy = 'startTime',
      sortOrder = 'DESC',
    } = queryDto;

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('booking.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('booking.startTime <= :endDate', { endDate });
    }

    // 排序
    const validSortFields = ['startTime', 'endTime', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
    queryBuilder.orderBy(
      `booking.${sortField}`,
      sortOrder === 'ASC' ? 'ASC' : 'DESC',
    );

    const bookings = await queryBuilder.getMany();

    return bookings.map((booking) => ({
      ...booking,
      isGroupClass: booking.isGroupClass(),
      isPersonalTraining: booking.isPersonalTraining(),
      canCancel: booking.isCancellable(),
      canCheckIn: booking.isCharged() && !booking.isCheckedIn(),
    }));
  }

  /**
   * 预约改期
   */
  async rescheduleBooking(
    bookingId: string,
    newStartTime: Date,
    newEndTime: Date,
    reason?: string,
    user?: User,
  ): Promise<Booking> {
    if (!user) {
      throw new BadRequestException('用户信息不能为空');
    }
    checkPermission(user.roles?.[0]?.name || '', 'booking', 'update');

    const booking = await this.findOne(bookingId, user);

    // 检查预约状态是否允许改期
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new BadRequestException('当前状态不允许改期');
    }

    // 检查改期时间是否在允许范围内
    const now = new Date();
    const timeDiff = booking.startTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60);

    if (hoursUntilBooking < 2) {
      throw new BadRequestException('预约开始前2小时内不允许改期');
    }

    // 验证新时间是否有冲突
    await this.validateBookingTime(
      {
        startTime: newStartTime,
        endTime: newEndTime,
        coachId: booking.coachId,
        memberId: booking.memberId,
        courseId: booking.courseId,
        storeId: booking.storeId,
      },
      user || ({ storeId: '' } as User),
      bookingId,
    );

    // 更新预约时间
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    booking.updatedBy = user?.id;
    booking.updatedAt = new Date();

    // 记录改期原因
    if (reason) {
      booking.notes = `${booking.notes || ''}\n改期原因: ${reason}`;
    }

    return await this.bookingRepository.save(booking);
  }

  /**
   * 获取需要提醒的预约
   */
  async getBookingsForReminder(
    reminderType: 'before_24h' | 'before_2h' | 'before_30min',
    user: User,
  ): Promise<Booking[]> {
    checkPermission(user.roles?.[0]?.name || '', 'booking', 'read');

    const now = new Date();
    let startTime: Date;
    let endTime: Date;

    switch (reminderType) {
      case 'before_24h':
        startTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
        endTime = new Date(now.getTime() + 25 * 60 * 60 * 1000);
        break;
      case 'before_2h':
        startTime = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
        endTime = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);
        break;
      case 'before_30min':
        startTime = new Date(now.getTime() + 25 * 60 * 1000);
        endTime = new Date(now.getTime() + 35 * 60 * 1000);
        break;
    }

    const queryBuilder = this.createBaseQuery(user)
      .andWhere('booking.status IN (:...statuses)', {
        statuses: ['pending', 'confirmed'],
      })
      .andWhere('booking.startTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime,
      });

    return await queryBuilder.getMany();
  }

  /**
   * 获取预约统计分析
   */
  async getBookingAnalytics(
    startDate: Date,
    endDate: Date,
    user: User,
  ): Promise<{
    totalBookings: number;
    completionRate: number;
    cancellationRate: number;
    noShowRate: number;
    popularTimeSlots: Array<{ hour: number; count: number }>;
    popularCourses: Array<{
      courseId: string;
      courseName: string;
      count: number;
    }>;
    coachPerformance: Array<{
      coachId: string;
      coachName: string;
      bookings: number;
      completionRate: number;
    }>;
    memberActivity: Array<{
      memberId: string;
      memberName: string;
      bookings: number;
    }>;
  }> {
    checkPermission(user.roles?.[0]?.name || '', 'booking', 'read');

    const baseQuery = this.createBaseQuery(
      user || ({ storeId: '' } as User),
      false,
    ).andWhere('booking.startTime BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });

    // 总预约数
    const totalBookings = await baseQuery.getCount();

    // 各状态统计
    const statusStats = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('booking.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('booking.deletedAt IS NULL')
      .groupBy('booking.status')
      .getRawMany();

    const completedCount =
      statusStats.find((s) => s.status === 'completed')?.count || 0;
    const cancelledCount =
      statusStats.find((s) => s.status === 'cancelled')?.count || 0;
    const noShowCount =
      statusStats.find((s) => s.status === 'no_show')?.count || 0;

    // 热门时间段
    const timeSlotStats = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('EXTRACT(HOUR FROM booking.startTime)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('booking.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('booking.deletedAt IS NULL')
      .groupBy('EXTRACT(HOUR FROM booking.startTime)')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 热门课程
    const popularCourses = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.course', 'course')
      .select('booking.courseId', 'courseId')
      .addSelect('course.name', 'courseName')
      .addSelect('COUNT(*)', 'count')
      .where('booking.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('booking.deletedAt IS NULL')
      .groupBy('booking.courseId, course.name')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 教练表现
    const coachPerformance = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.coach', 'coach')
      .select('booking.coachId', 'coachId')
      .addSelect('coach.name', 'coachName')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect(
        "ROUND(COUNT(CASE WHEN booking.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2)",
        'completionRate',
      )
      .where('booking.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('booking.deletedAt IS NULL')
      .groupBy('booking.coachId, coach.name')
      .orderBy('bookings', 'DESC')
      .getRawMany();

    // 会员活跃度
    const memberActivity = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.member', 'member')
      .select('booking.memberId', 'memberId')
      .addSelect('member.name', 'memberName')
      .addSelect('COUNT(*)', 'bookings')
      .where('booking.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('booking.deletedAt IS NULL')
      .groupBy('booking.memberId, member.name')
      .orderBy('bookings', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      totalBookings,
      completionRate:
        totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0,
      cancellationRate:
        totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0,
      noShowRate: totalBookings > 0 ? (noShowCount / totalBookings) * 100 : 0,
      popularTimeSlots: timeSlotStats.map((item) => ({
        hour: parseInt(item.hour),
        count: parseInt(item.count),
      })),
      popularCourses: popularCourses.map((item) => ({
        courseId: item.courseId,
        courseName: item.courseName,
        count: parseInt(item.count),
      })),
      coachPerformance: coachPerformance.map((item) => ({
        coachId: item.coachId,
        coachName: item.coachName,
        bookings: parseInt(item.bookings),
        completionRate: parseFloat(item.completionRate),
      })),
      memberActivity: memberActivity.map((item) => ({
        memberId: item.memberId,
        memberName: item.memberName,
        bookings: parseInt(item.bookings),
      })),
    };
  }

  /**
   * 批量操作预约
   */
  async batchUpdateBookings(
    bookingIds: string[],
    operation: 'confirm' | 'cancel' | 'complete',
    reason?: string,
    user?: User,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    checkPermission(user?.roles?.[0]?.name || '', 'booking', 'update');

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const bookingId of bookingIds) {
      try {
        if (!user) {
          throw new Error('用户信息不能为空');
        }
        switch (operation) {
          case 'confirm':
            await this.confirm(bookingId, user);
            break;
          case 'cancel':
            await this.cancel(bookingId, reason, user);
            break;
          case 'complete':
            await this.complete(bookingId, user);
            break;
        }
        success++;
      } catch (error) {
        failed++;
        errors.push(`预约 ${bookingId}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * 获取预约冲突详情
   */
  async getConflictDetails(
    startTime: Date,
    endTime: Date,
    coachId?: string,
    memberId?: string,
    courseId?: string,
    storeId?: string,
    user?: User,
  ): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      type: 'coach' | 'member' | 'capacity';
      booking: Booking;
      message: string;
    }>;
  }> {
    const conflictResult = await this.checkConflicts(
      {
        startTime,
        endTime,
        coachId,
        memberId,
        courseId,
        storeId,
      },
      user || ({ storeId: '' } as User),
    );

    const conflicts: Array<{
      type: 'coach' | 'member' | 'capacity';
      booking: Booking;
      message: string;
    }> = [];

    // 教练冲突
    for (const booking of conflictResult.coachConflicts) {
      conflicts.push({
        type: 'coach' as const,
        booking,
        message: `教练 ${booking.coach?.name} 在此时间段已有预约`,
      });
    }

    // 会员冲突
    for (const booking of conflictResult.memberConflicts) {
      conflicts.push({
        type: 'member' as const,
        booking,
        message: `会员 ${booking.member?.name} 在此时间段已有私教预约`,
      });
    }

    // 容量冲突
    if (conflictResult.capacityConflicts.length > 0 && courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (
        course &&
        conflictResult.capacityConflicts.length >= (course as any).capacity
      ) {
        conflicts.push({
          type: 'capacity' as const,
          booking: conflictResult.capacityConflicts[0],
          message: `课程 ${course.name} 已达到最大容量 ${(course as any).capacity} 人`,
        });
      }
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * 自动处理过期预约
   */
  async processExpiredBookings(): Promise<{
    processed: number;
    errors: string[];
  }> {
    const now = new Date();
    const expiredBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status = :status', { status: 'pending' })
      .andWhere('booking.startTime < :now', { now })
      .andWhere('booking.deletedAt IS NULL')
      .getMany();

    let processed = 0;
    const errors: string[] = [];

    for (const booking of expiredBookings) {
      try {
        booking.status = 'cancelled';
        booking.notes = `${booking.notes || ''}\n系统自动取消：预约已过期`;
        booking.updatedAt = now;
        await this.bookingRepository.save(booking);
        processed++;
      } catch (error) {
        errors.push(`处理预约 ${booking.bookingNumber} 失败: ${error.message}`);
      }
    }

    return { processed, errors };
  }
}

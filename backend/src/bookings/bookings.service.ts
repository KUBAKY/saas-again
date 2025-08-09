import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto, user: User): Promise<Booking> {
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
        '(booking.bookingNumber ILIKE :search OR member.realName ILIKE :search)',
        { search: `%${search}%` }
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
    const validSortFields = ['bookingNumber', 'startTime', 'endTime', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
    queryBuilder.orderBy(`booking.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

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

  async update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<Booking> {
    const booking = await this.findOne(id, user);

    // 权限检查
    this.checkUpdatePermission(booking, user);

    // 如果更新时间，需要检查冲突
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      await this.validateBookingTime({
        ...updateBookingDto,
        startTime: updateBookingDto.startTime || booking.startTime,
        endTime: updateBookingDto.endTime || booking.endTime,
        coachId: updateBookingDto.coachId || booking.coachId,
        memberId: booking.memberId,
        courseId: updateBookingDto.courseId || booking.courseId,
        storeId: booking.storeId,
      }, user, id);
    }

    Object.assign(booking, updateBookingDto);
    booking.updatedAt = new Date();

    return await this.bookingRepository.save(booking);
  }

  async updateStatus(
    id: string, 
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show',
    reason?: string,
    user?: User
  ): Promise<Booking> {
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
    const booking = await this.findOne(id, user);

    if (!booking.isCancellable()) {
      throw new BadRequestException('预约无法取消（可能已开始或开始前2小时内）');
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

  async addReview(id: string, rating: number, review?: string, user?: User): Promise<Booking> {
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
    if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(user.roles?.[0]?.name)) {
      throw new ForbiddenException('权限不足，无法删除预约');
    }

    booking.deletedAt = new Date();
    await this.bookingRepository.save(booking);

    return { message: '预约删除成功' };
  }

  async getStats(user: User) {
    const queryBuilder = this.createBaseQuery(user, false);

    const [
      total,
      pending,
      confirmed,
      cancelled,
      completed,
      noShow,
    ] = await Promise.all([
      queryBuilder.clone().getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: 'pending' }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: 'confirmed' }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: 'cancelled' }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: 'completed' }).getCount(),
      queryBuilder.clone().andWhere('booking.status = :status', { status: 'no_show' }).getCount(),
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
    return bookings.map(booking => ({
      id: booking.id,
      title: `${booking.course.name} - ${booking.member.realName}`,
      start: booking.startTime,
      end: booking.endTime,
      status: booking.status,
      member: booking.member.realName,
      coach: booking.coach?.realName,
      course: booking.course.name,
      color: this.getStatusColor(booking.status),
    }));
  }

  async checkConflicts(query: any, user: User) {
    const { startTime, endTime, coachId, memberId, excludeBookingId } = query;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
      .andWhere('booking.deletedAt IS NULL')
      .andWhere(
        '(booking.startTime < :endTime AND booking.endTime > :startTime)',
        { startTime, endTime }
      );

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    // 检查教练冲突
    let coachConflicts = [];
    if (coachId) {
      const coachQuery = queryBuilder.clone().andWhere('booking.coachId = :coachId', { coachId });
      coachConflicts = await coachQuery.getMany();
    }

    // 检查会员冲突
    let memberConflicts = [];
    if (memberId) {
      const memberQuery = queryBuilder.clone().andWhere('booking.memberId = :memberId', { memberId });
      memberConflicts = await memberQuery.getMany();
    }

    return {
      hasConflicts: coachConflicts.length > 0 || memberConflicts.length > 0,
      coachConflicts,
      memberConflicts,
    };
  }

  private createBaseQuery(user: User, withRelations: boolean = true): SelectQueryBuilder<Booking> {
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
      queryBuilder.andWhere('booking.storeId = :storeId', { storeId: user.storeId });
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
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private async validateBookingTime(bookingData: any, user: User, excludeId?: string) {
    const conflicts = await this.checkConflicts({
      ...bookingData,
      excludeBookingId: excludeId,
    }, user);

    if (conflicts.hasConflicts) {
      throw new ConflictException('预约时间冲突');
    }
  }

  private checkUpdatePermission(booking: Booking, user: User) {
    const userRole = user.roles?.[0]?.name;
    
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
      throw new BadRequestException(`无法从状态 ${currentStatus} 转换到 ${newStatus}`);
    }
  }

  private getStatusColor(status: string): string {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      cancelled: '#e74c3c',
      completed: '#3498db',
      no_show: '#95a5a6',
    };

    return colors[status] || '#95a5a6';
  }
}
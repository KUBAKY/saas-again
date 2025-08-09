import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Member } from '../entities/member.entity';
import { Booking } from '../entities/booking.entity';
import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
import { checkPermission } from '../common/utils/permission.util';

export interface ReportQueryDto {
  startDate: Date;
  endDate: Date;
  storeId?: string;
  type?: string;
}

export interface MemberReportDto {
  totalMembers: number;
  newMembers: number;
  activeMembers: number;
  memberGrowthRate: number;
  membersByType: Array<{ type: string; count: number }>;
  membersByAge: Array<{ ageGroup: string; count: number }>;
  membersByGender: Array<{ gender: string; count: number }>;
}

export interface BookingReportDto {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  bookingCompletionRate: number;
  bookingsByDate: Array<{ date: string; count: number }>;
  popularCourses: Array<{ courseName: string; bookingCount: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export interface RevenueReportDto {
  totalRevenue: number;
  membershipRevenue: number;
  courseRevenue: number;
  otherRevenue: number;
  revenueByDate: Array<{ date: string; amount: number }>;
  revenueByPaymentMethod: Array<{ method: string; amount: number }>;
  averageOrderValue: number;
}

export interface CoachReportDto {
  totalCoaches: number;
  activeCoaches: number;
  coachUtilization: Array<{
    coachId: string;
    coachName: string;
    totalHours: number;
    bookedHours: number;
    utilizationRate: number;
  }>;
  coachRatings: Array<{
    coachId: string;
    coachName: string;
    averageRating: number;
    totalRatings: number;
  }>;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(MembershipCard)
    private membershipCardRepository: Repository<MembershipCard>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 获取会员报表
   */
  async getMemberReport(
    queryDto: ReportQueryDto,
    currentUser: User,
  ): Promise<MemberReportDto> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'report', 'read');

    const { startDate, endDate, storeId } = queryDto;
    const targetStoreId = storeId || currentUser.storeId;

    // 总会员数
    const totalMembers = await this.memberRepository.count({
      where: { storeId: targetStoreId },
    });

    // 新增会员数
    const newMembers = await this.memberRepository.count({
      where: {
        storeId: targetStoreId,
        createdAt: Between(startDate, endDate),
      },
    });

    // 活跃会员数（有预约记录的会员）
    const activeMembers = await this.memberRepository
      .createQueryBuilder('member')
      .innerJoin('member.bookings', 'booking')
      .where('member.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    // 会员增长率
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(
      previousPeriodStart.getDate() -
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const previousNewMembers = await this.memberRepository.count({
      where: {
        storeId: targetStoreId,
        createdAt: Between(previousPeriodStart, startDate),
      },
    });
    const memberGrowthRate =
      previousNewMembers > 0
        ? ((newMembers - previousNewMembers) / previousNewMembers) * 100
        : 0;

    // 按会员类型统计
    const membersByType = await this.memberRepository
      .createQueryBuilder('member')
      .select('member.memberType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('member.storeId = :storeId', { storeId: targetStoreId })
      .groupBy('member.memberType')
      .getRawMany();

    // 按年龄段统计
    const membersByAge = await this.memberRepository
      .createQueryBuilder('member')
      .select(
        `CASE 
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) < 18 THEN '18岁以下'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 18 AND 25 THEN '18-25岁'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 26 AND 35 THEN '26-35岁'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 36 AND 45 THEN '36-45岁'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 46 AND 55 THEN '46-55岁'
          ELSE '55岁以上'
        END`,
        'ageGroup',
      )
      .addSelect('COUNT(*)', 'count')
      .where('member.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('member.birthday IS NOT NULL')
      .groupBy('ageGroup')
      .getRawMany();

    // 按性别统计
    const membersByGender = await this.memberRepository
      .createQueryBuilder('member')
      .select('member.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .where('member.storeId = :storeId', { storeId: targetStoreId })
      .groupBy('member.gender')
      .getRawMany();

    return {
      totalMembers,
      newMembers,
      activeMembers,
      memberGrowthRate,
      membersByType: membersByType.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
      membersByAge: membersByAge.map((item) => ({
        ageGroup: item.ageGroup,
        count: parseInt(item.count),
      })),
      membersByGender: membersByGender.map((item) => ({
        gender: item.gender,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 获取预约报表
   */
  async getBookingReport(
    queryDto: ReportQueryDto,
    currentUser: User,
  ): Promise<BookingReportDto> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'report', 'read');

    const { startDate, endDate, storeId } = queryDto;
    const targetStoreId = storeId || currentUser.storeId;

    // 总预约数
    const totalBookings = await this.bookingRepository.count({
      where: {
        storeId: targetStoreId,
        createdAt: Between(startDate, endDate),
      },
    });

    // 已完成预约数
    const completedBookings = await this.bookingRepository.count({
      where: {
        storeId: targetStoreId,
        status: 'completed',
        createdAt: Between(startDate, endDate),
      },
    });

    // 已取消预约数
    const cancelledBookings = await this.bookingRepository.count({
      where: {
        storeId: targetStoreId,
        status: 'cancelled',
        createdAt: Between(startDate, endDate),
      },
    });

    // 爽约预约数
    const noShowBookings = await this.bookingRepository.count({
      where: {
        storeId: targetStoreId,
        status: 'no_show',
        createdAt: Between(startDate, endDate),
      },
    });

    // 预约完成率
    const bookingCompletionRate =
      totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // 按日期统计预约数
    const bookingsByDate = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('DATE(booking.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('booking.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(booking.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 热门课程
    const popularCourses = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.course', 'course')
      .select('course.name', 'courseName')
      .addSelect('COUNT(*)', 'bookingCount')
      .where('booking.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('course.id, course.name')
      .orderBy('bookingCount', 'DESC')
      .limit(10)
      .getRawMany();

    // 高峰时段
    const peakHours = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('EXTRACT(HOUR FROM booking.startTime)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('booking.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('hour')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      bookingCompletionRate,
      bookingsByDate: bookingsByDate.map((item) => ({
        date: item.date,
        count: parseInt(item.count),
      })),
      popularCourses: popularCourses.map((item) => ({
        courseName: item.courseName,
        bookingCount: parseInt(item.bookingCount),
      })),
      peakHours: peakHours.map((item) => ({
        hour: parseInt(item.hour),
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 获取收入报表
   */
  async getRevenueReport(
    queryDto: ReportQueryDto,
    currentUser: User,
  ): Promise<RevenueReportDto> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'report', 'read');

    const { startDate, endDate, storeId } = queryDto;
    const targetStoreId = storeId || currentUser.storeId;

    // 总收入
    const totalRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    // 会员卡收入
    const membershipRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .select('SUM(payment.amount)', 'total')
      .where('payment.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('order.type = :type', { type: 'membership' })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();
    const membershipRevenue = parseFloat(membershipRevenueResult?.total || '0');

    // 课程收入
    const courseRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.order', 'order')
      .select('SUM(payment.amount)', 'total')
      .where('payment.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('order.type = :type', { type: 'course' })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();
    const courseRevenue = parseFloat(courseRevenueResult?.total || '0');

    // 其他收入
    const otherRevenue = totalRevenue - membershipRevenue - courseRevenue;

    // 按日期统计收入
    const revenueByDate = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.createdAt)', 'date')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(payment.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 按支付方式统计收入
    const revenueByPaymentMethod = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.paymentMethod', 'method')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('payment.paymentMethod')
      .getRawMany();

    // 平均订单价值
    const orderCountResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .where('order.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('order.status = :status', { status: 'paid' })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();
    const orderCount = parseInt(orderCountResult?.count || '0');
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    return {
      totalRevenue,
      membershipRevenue,
      courseRevenue,
      otherRevenue,
      revenueByDate: revenueByDate.map((item) => ({
        date: item.date,
        amount: parseFloat(item.amount),
      })),
      revenueByPaymentMethod: revenueByPaymentMethod.map((item) => ({
        method: item.method,
        amount: parseFloat(item.amount),
      })),
      averageOrderValue,
    };
  }

  /**
   * 获取教练报表
   */
  async getCoachReport(
    queryDto: ReportQueryDto,
    currentUser: User,
  ): Promise<CoachReportDto> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'report', 'read');

    const { startDate, endDate, storeId } = queryDto;
    const targetStoreId = storeId || currentUser.storeId;

    // 总教练数
    const totalCoaches = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .where('user.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('role.name = :roleName', { roleName: 'coach' })
      .getCount();

    // 活跃教练数（有预约记录的教练）
    const activeCoaches = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .innerJoin('user.bookings', 'booking')
      .where('user.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('role.name = :roleName', { roleName: 'coach' })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    // 教练利用率
    const coachUtilization = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .leftJoin('user.bookings', 'booking')
      .select('user.id', 'coachId')
      .addSelect('user.name', 'coachName')
      .addSelect(
        'COALESCE(SUM(EXTRACT(EPOCH FROM (booking.endTime - booking.startTime)) / 3600), 0)',
        'bookedHours',
      )
      .where('user.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('role.name = :roleName', { roleName: 'coach' })
      .andWhere(
        '(booking.createdAt BETWEEN :startDate AND :endDate OR booking.id IS NULL)',
        { startDate, endDate },
      )
      .groupBy('user.id, user.name')
      .getRawMany();

    // 假设每个教练每天工作8小时
    const workingDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalWorkingHours = workingDays * 8;

    const coachUtilizationWithRate = coachUtilization.map((coach) => ({
      coachId: coach.coachId,
      coachName: coach.coachName,
      totalHours: totalWorkingHours,
      bookedHours: parseFloat(coach.bookedHours),
      utilizationRate:
        (parseFloat(coach.bookedHours) / totalWorkingHours) * 100,
    }));

    // 教练评分（这里需要根据实际的评分表结构调整）
    const coachRatings = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .select('user.id', 'coachId')
      .addSelect('user.name', 'coachName')
      .addSelect('0', 'averageRating') // 占位符，需要根据实际评分表调整
      .addSelect('0', 'totalRatings') // 占位符，需要根据实际评分表调整
      .where('user.storeId = :storeId', { storeId: targetStoreId })
      .andWhere('role.name = :roleName', { roleName: 'coach' })
      .groupBy('user.id, user.name')
      .getRawMany();

    return {
      totalCoaches,
      activeCoaches,
      coachUtilization: coachUtilizationWithRate,
      coachRatings: coachRatings.map((rating) => ({
        coachId: rating.coachId,
        coachName: rating.coachName,
        averageRating: parseFloat(rating.averageRating),
        totalRatings: parseInt(rating.totalRatings),
      })),
    };
  }

  /**
   * 获取综合仪表板数据
   */
  async getDashboardData(queryDto: ReportQueryDto, currentUser: User) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'report', 'read');

    const [memberReport, bookingReport, revenueReport, coachReport] =
      await Promise.all([
        this.getMemberReport(queryDto, currentUser),
        this.getBookingReport(queryDto, currentUser),
        this.getRevenueReport(queryDto, currentUser),
        this.getCoachReport(queryDto, currentUser),
      ]);

    return {
      member: memberReport,
      booking: bookingReport,
      revenue: revenueReport,
      coach: coachReport,
      summary: {
        totalMembers: memberReport.totalMembers,
        totalBookings: bookingReport.totalBookings,
        totalRevenue: revenueReport.totalRevenue,
        totalCoaches: coachReport.totalCoaches,
      },
    };
  }

  /**
   * 导出报表数据
   */
  async exportReport(
    type: 'member' | 'booking' | 'revenue' | 'coach',
    queryDto: ReportQueryDto,
    currentUser: User,
  ) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'report', 'export');

    let data;
    switch (type) {
      case 'member':
        data = await this.getMemberReport(queryDto, currentUser);
        break;
      case 'booking':
        data = await this.getBookingReport(queryDto, currentUser);
        break;
      case 'revenue':
        data = await this.getRevenueReport(queryDto, currentUser);
        break;
      case 'coach':
        data = await this.getCoachReport(queryDto, currentUser);
        break;
      default:
        throw new BadRequestException('不支持的报表类型');
    }

    // 这里应该实现具体的导出逻辑（Excel、PDF等）
    // 返回文件下载链接或文件内容
    return {
      type,
      data,
      exportTime: new Date(),
      filename: `${type}_report_${Date.now()}.json`,
    };
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const member_entity_1 = require("../entities/member.entity");
const booking_entity_1 = require("../entities/booking.entity");
const payment_entity_1 = require("../entities/payment.entity");
const order_entity_1 = require("../entities/order.entity");
const membership_card_entity_1 = require("../entities/membership-card.entity");
const course_entity_1 = require("../entities/course.entity");
const user_entity_1 = require("../entities/user.entity");
const permission_util_1 = require("../common/utils/permission.util");
let ReportsService = class ReportsService {
    memberRepository;
    bookingRepository;
    paymentRepository;
    orderRepository;
    membershipCardRepository;
    courseRepository;
    userRepository;
    constructor(memberRepository, bookingRepository, paymentRepository, orderRepository, membershipCardRepository, courseRepository, userRepository) {
        this.memberRepository = memberRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.membershipCardRepository = membershipCardRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }
    async getMemberReport(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'report', 'read');
        const { startDate, endDate, storeId } = queryDto;
        const targetStoreId = storeId || currentUser.storeId;
        const totalMembers = await this.memberRepository.count({
            where: { storeId: targetStoreId },
        });
        const newMembers = await this.memberRepository.count({
            where: {
                storeId: targetStoreId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const activeMembers = await this.memberRepository
            .createQueryBuilder('member')
            .innerJoin('member.bookings', 'booking')
            .where('member.storeId = :storeId', { storeId: targetStoreId })
            .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .getCount();
        const previousPeriodStart = new Date(startDate);
        previousPeriodStart.setDate(previousPeriodStart.getDate() -
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const previousNewMembers = await this.memberRepository.count({
            where: {
                storeId: targetStoreId,
                createdAt: (0, typeorm_2.Between)(previousPeriodStart, startDate),
            },
        });
        const memberGrowthRate = previousNewMembers > 0
            ? ((newMembers - previousNewMembers) / previousNewMembers) * 100
            : 0;
        const membersByType = await this.memberRepository
            .createQueryBuilder('member')
            .select('member.memberType', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('member.storeId = :storeId', { storeId: targetStoreId })
            .groupBy('member.memberType')
            .getRawMany();
        const membersByAge = await this.memberRepository
            .createQueryBuilder('member')
            .select(`CASE 
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) < 18 THEN '18岁以下'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 18 AND 25 THEN '18-25岁'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 26 AND 35 THEN '26-35岁'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 36 AND 45 THEN '36-45岁'
          WHEN EXTRACT(YEAR FROM AGE(member.birthday)) BETWEEN 46 AND 55 THEN '46-55岁'
          ELSE '55岁以上'
        END`, 'ageGroup')
            .addSelect('COUNT(*)', 'count')
            .where('member.storeId = :storeId', { storeId: targetStoreId })
            .andWhere('member.birthday IS NOT NULL')
            .groupBy('ageGroup')
            .getRawMany();
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
    async getBookingReport(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'report', 'read');
        const { startDate, endDate, storeId } = queryDto;
        const targetStoreId = storeId || currentUser.storeId;
        const totalBookings = await this.bookingRepository.count({
            where: {
                storeId: targetStoreId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const completedBookings = await this.bookingRepository.count({
            where: {
                storeId: targetStoreId,
                status: 'completed',
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const cancelledBookings = await this.bookingRepository.count({
            where: {
                storeId: targetStoreId,
                status: 'cancelled',
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const noShowBookings = await this.bookingRepository.count({
            where: {
                storeId: targetStoreId,
                status: 'no_show',
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const bookingCompletionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
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
    async getRevenueReport(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'report', 'read');
        const { startDate, endDate, storeId } = queryDto;
        const targetStoreId = storeId || currentUser.storeId;
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
        const otherRevenue = totalRevenue - membershipRevenue - courseRevenue;
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
    async getCoachReport(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'report', 'read');
        const { startDate, endDate, storeId } = queryDto;
        const targetStoreId = storeId || currentUser.storeId;
        const totalCoaches = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'role')
            .where('user.storeId = :storeId', { storeId: targetStoreId })
            .andWhere('role.name = :roleName', { roleName: 'coach' })
            .getCount();
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
        const coachUtilization = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'role')
            .leftJoin('user.bookings', 'booking')
            .select('user.id', 'coachId')
            .addSelect('user.name', 'coachName')
            .addSelect('COALESCE(SUM(EXTRACT(EPOCH FROM (booking.endTime - booking.startTime)) / 3600), 0)', 'bookedHours')
            .where('user.storeId = :storeId', { storeId: targetStoreId })
            .andWhere('role.name = :roleName', { roleName: 'coach' })
            .andWhere('(booking.createdAt BETWEEN :startDate AND :endDate OR booking.id IS NULL)', { startDate, endDate })
            .groupBy('user.id, user.name')
            .getRawMany();
        const workingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalWorkingHours = workingDays * 8;
        const coachUtilizationWithRate = coachUtilization.map((coach) => ({
            coachId: coach.coachId,
            coachName: coach.coachName,
            totalHours: totalWorkingHours,
            bookedHours: parseFloat(coach.bookedHours),
            utilizationRate: (parseFloat(coach.bookedHours) / totalWorkingHours) * 100,
        }));
        const coachRatings = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('user.roles', 'role')
            .select('user.id', 'coachId')
            .addSelect('user.name', 'coachName')
            .addSelect('0', 'averageRating')
            .addSelect('0', 'totalRatings')
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
    async getDashboardData(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'report', 'read');
        const [memberReport, bookingReport, revenueReport, coachReport] = await Promise.all([
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
    async exportReport(type, queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'report', 'export');
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
                throw new common_1.BadRequestException('不支持的报表类型');
        }
        return {
            type,
            data,
            exportTime: new Date(),
            filename: `${type}_report_${Date.now()}.json`,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(membership_card_entity_1.MembershipCard)),
    __param(5, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map
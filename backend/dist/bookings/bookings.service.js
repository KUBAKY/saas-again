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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("../entities/booking.entity");
const course_schedule_entity_1 = require("../entities/course-schedule.entity");
const course_entity_1 = require("../entities/course.entity");
const member_entity_1 = require("../entities/member.entity");
const coach_entity_1 = require("../entities/coach.entity");
const permission_util_1 = require("../common/utils/permission.util");
let BookingsService = class BookingsService {
    bookingRepository;
    courseScheduleRepository;
    courseRepository;
    memberRepository;
    coachRepository;
    constructor(bookingRepository, courseScheduleRepository, courseRepository, memberRepository, coachRepository) {
        this.bookingRepository = bookingRepository;
        this.courseScheduleRepository = courseScheduleRepository;
        this.courseRepository = courseRepository;
        this.memberRepository = memberRepository;
        this.coachRepository = coachRepository;
    }
    async create(createBookingDto, user) {
        const bookingNumber = await this.generateBookingNumber();
        await this.validateBookingTime(createBookingDto, user);
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
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, search, status, memberId, coachId, courseId, storeId, startDate, endDate, sortBy = 'startTime', sortOrder = 'DESC', } = queryDto;
        const queryBuilder = this.createBaseQuery(user);
        if (search) {
            queryBuilder.andWhere('(booking.bookingNumber ILIKE :search OR member.name ILIKE :search)', { search: `%${search}%` });
        }
        if (status) {
            queryBuilder.andWhere('booking.status = :status', { status });
        }
        if (memberId) {
            queryBuilder.andWhere('booking.memberId = :memberId', { memberId });
        }
        if (coachId) {
            queryBuilder.andWhere('booking.coachId = :coachId', { coachId });
        }
        if (courseId) {
            queryBuilder.andWhere('booking.courseId = :courseId', { courseId });
        }
        if (storeId) {
            queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
        }
        if (startDate) {
            queryBuilder.andWhere('booking.startTime >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('booking.startTime <= :endDate', { endDate });
        }
        const validSortFields = [
            'bookingNumber',
            'startTime',
            'endTime',
            'status',
            'createdAt',
        ];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
        queryBuilder.orderBy(`booking.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
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
    async findOne(id, user) {
        const queryBuilder = this.createBaseQuery(user);
        queryBuilder.andWhere('booking.id = :id', { id });
        const booking = await queryBuilder.getOne();
        if (!booking) {
            throw new common_1.NotFoundException('预约不存在');
        }
        return booking;
    }
    async update(id, updateBookingDto, user) {
        const booking = await this.findOne(id, user);
        this.checkUpdatePermission(booking, user);
        if (updateBookingDto.startTime || updateBookingDto.endTime) {
            await this.validateBookingTime({
                ...updateBookingDto,
                startTime: updateBookingDto.startTime || booking.startTime,
                endTime: updateBookingDto.endTime || booking.endTime,
                coachId: updateBookingDto.coachId || booking.coachId,
                memberId: booking.memberId,
                courseId: updateBookingDto.courseId || booking.courseId,
                storeId: booking.storeId,
            }, user || { storeId: booking.storeId }, id);
        }
        Object.assign(booking, updateBookingDto);
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async updateStatus(id, status, reason, user) {
        if (!user) {
            throw new common_1.UnauthorizedException('用户信息不能为空');
        }
        const booking = await this.findOne(id, user);
        this.validateStatusTransition(booking.status, status);
        booking.status = status;
        booking.updatedAt = new Date();
        if (status === 'cancelled') {
            booking.cancelledAt = new Date();
            booking.cancellationReason = reason;
        }
        return await this.bookingRepository.save(booking);
    }
    async confirm(id, user) {
        const booking = await this.findOne(id, user);
        if (booking.status !== 'pending') {
            throw new common_1.BadRequestException('只有待确认的预约才能被确认');
        }
        booking.confirm();
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async cancel(id, reason, user) {
        if (!user) {
            throw new common_1.UnauthorizedException('用户信息不能为空');
        }
        const booking = await this.findOne(id, user);
        if (!booking.isCancellable()) {
            throw new common_1.BadRequestException('预约无法取消（可能已开始或开始前2小时内）');
        }
        const success = booking.cancel(reason);
        if (!success) {
            throw new common_1.BadRequestException('预约取消失败');
        }
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async complete(id, user) {
        const booking = await this.findOne(id, user);
        if (booking.status !== 'confirmed') {
            throw new common_1.BadRequestException('只有已确认的预约才能标记为完成');
        }
        if (!booking.isPast()) {
            throw new common_1.BadRequestException('只有已结束的预约才能标记为完成');
        }
        booking.complete();
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async addReview(id, rating, review, user) {
        if (!user) {
            throw new common_1.UnauthorizedException('用户信息不能为空');
        }
        const booking = await this.findOne(id, user);
        if (booking.status !== 'completed') {
            throw new common_1.BadRequestException('只有已完成的预约才能评价');
        }
        if (booking.hasReview()) {
            throw new common_1.BadRequestException('该预约已经评价过了');
        }
        booking.addReview(rating, review);
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async remove(id, user) {
        const booking = await this.findOne(id, user);
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法删除预约');
        }
        booking.deletedAt = new Date();
        await this.bookingRepository.save(booking);
        return { message: '预约删除成功' };
    }
    async getStats(user) {
        const queryBuilder = this.createBaseQuery(user || { storeId: '' }, false);
        const [total, pending, confirmed, cancelled, completed, noShow] = await Promise.all([
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
    async getCalendarBookings(query, user) {
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
    async checkConflicts(query, user) {
        const { startTime, endTime, coachId, memberId, excludeBookingId, courseId, storeId, } = query;
        const queryBuilder = this.bookingRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.course', 'course')
            .leftJoinAndSelect('booking.coach', 'coach')
            .leftJoinAndSelect('booking.member', 'member')
            .where('booking.status IN (:...statuses)', {
            statuses: ['pending', 'confirmed'],
        })
            .andWhere('booking.deletedAt IS NULL')
            .andWhere('(booking.startTime < :endTime AND booking.endTime > :startTime)', { startTime, endTime });
        if (excludeBookingId) {
            queryBuilder.andWhere('booking.id != :excludeBookingId', {
                excludeBookingId,
            });
        }
        if (storeId) {
            queryBuilder.andWhere('booking.storeId = :storeId', { storeId });
        }
        let coachConflicts = [];
        if (coachId) {
            const coachQuery = queryBuilder
                .clone()
                .andWhere('booking.coachId = :coachId', { coachId });
            coachConflicts = await coachQuery.getMany();
        }
        let memberConflicts = [];
        if (memberId) {
            const memberQuery = queryBuilder
                .clone()
                .andWhere('booking.memberId = :memberId', { memberId })
                .andWhere('course.type = :courseType', { courseType: 'personal' });
            memberConflicts = await memberQuery.getMany();
        }
        let capacityConflicts = [];
        if (courseId) {
            const capacityQuery = this.bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.course', 'course')
                .where('booking.courseId = :courseId', { courseId })
                .andWhere('booking.status IN (:...statuses)', {
                statuses: ['pending', 'confirmed'],
            })
                .andWhere('booking.deletedAt IS NULL')
                .andWhere('(booking.startTime < :endTime AND booking.endTime > :startTime)', { startTime, endTime });
            if (excludeBookingId) {
                capacityQuery.andWhere('booking.id != :excludeBookingId', {
                    excludeBookingId,
                });
            }
            capacityConflicts = await capacityQuery.getMany();
        }
        const conflictTypes = [];
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
            hasConflicts: coachConflicts.length > 0 ||
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
    createBaseQuery(user, withRelations = true) {
        const queryBuilder = this.bookingRepository.createQueryBuilder('booking');
        if (withRelations) {
            queryBuilder
                .leftJoinAndSelect('booking.member', 'member')
                .leftJoinAndSelect('booking.coach', 'coach')
                .leftJoinAndSelect('booking.course', 'course')
                .leftJoinAndSelect('booking.store', 'store');
        }
        if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
            queryBuilder.andWhere('booking.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        else if (user.roles?.[0]?.name === 'BRAND_MANAGER' && user.brandId) {
            queryBuilder
                .leftJoin('booking.store', 'filterStore')
                .andWhere('filterStore.brandId = :brandId', { brandId: user.brandId });
        }
        queryBuilder.andWhere('booking.deletedAt IS NULL');
        return queryBuilder;
    }
    async generateBookingNumber() {
        const prefix = 'BK';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
    async validateBookingTime(bookingData, user, excludeId) {
        const conflicts = await this.checkConflicts({
            ...bookingData,
            excludeBookingId: excludeId,
        }, user || { storeId: '' });
        if (conflicts.hasConflicts) {
            throw new common_1.ConflictException('预约时间冲突');
        }
    }
    checkUpdatePermission(booking, user) {
        const userRole = user.roles?.[0]?.name || '';
        if (['ADMIN', 'BRAND_MANAGER'].includes(userRole)) {
            return;
        }
        if (userRole === 'STORE_MANAGER') {
            if (booking.storeId !== user.storeId) {
                throw new common_1.ForbiddenException('权限不足，只能修改自己门店的预约');
            }
            return;
        }
        throw new common_1.ForbiddenException('权限不足，无法修改预约');
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['completed', 'cancelled', 'no_show'],
            cancelled: [],
            completed: [],
            no_show: [],
        };
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new common_1.BadRequestException(`无法从状态 ${currentStatus} 转换到 ${newStatus}`);
        }
    }
    getStatusColor(status) {
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
    async processAutoCharging() {
        const threeHoursFromNow = new Date();
        threeHoursFromNow.setHours(threeHoursFromNow.getHours() + 3);
        const bookingsToCharge = await this.bookingRepository.find({
            where: {
                status: 'confirmed',
                startTime: (0, typeorm_2.LessThan)(threeHoursFromNow),
                deletedAt: (0, typeorm_2.IsNull)(),
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
            }
            catch (error) {
                console.error(`扣费失败 - 预约ID: ${booking.id}`, error);
                failed++;
            }
        }
        return { processed, failed };
    }
    async checkIn(bookingId, user) {
        if (!user) {
            throw new common_1.BadRequestException('用户信息不能为空');
        }
        if (!user) {
            throw new common_1.BadRequestException('用户信息不能为空');
        }
        if (!user) {
            throw new common_1.BadRequestException('用户信息不能为空');
        }
        const booking = await this.findOne(bookingId, user);
        if (!booking.isCharged()) {
            throw new common_1.BadRequestException('只有已扣费的预约才能签到');
        }
        if (booking.isCheckedIn()) {
            throw new common_1.BadRequestException('该预约已经签到过了');
        }
        const now = new Date();
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        const thirtyMinutesBefore = new Date(startTime.getTime() - 30 * 60 * 1000);
        const thirtyMinutesAfter = new Date(endTime.getTime() + 30 * 60 * 1000);
        if (now < thirtyMinutesBefore || now > thirtyMinutesAfter) {
            throw new common_1.BadRequestException('不在签到时间范围内');
        }
        booking.checkIn();
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async markCompleted(bookingId, user) {
        const booking = await this.findOne(bookingId, user);
        if (!booking.isCheckedIn()) {
            throw new common_1.BadRequestException('只有已签到的预约才能标记为完成');
        }
        booking.complete();
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async markNoShow(bookingId, user) {
        const booking = await this.findOne(bookingId, user);
        if (!booking.isCharged()) {
            throw new common_1.BadRequestException('只有已扣费的预约才能标记为未到课');
        }
        if (booking.isCheckedIn()) {
            throw new common_1.BadRequestException('已签到的预约不能标记为未到课');
        }
        const now = new Date();
        const endTime = new Date(booking.endTime);
        if (now <= endTime) {
            throw new common_1.BadRequestException('课程尚未结束，不能标记为未到课');
        }
        booking.markNoShow();
        booking.updatedAt = new Date();
        return await this.bookingRepository.save(booking);
    }
    async createGroupClassBooking(scheduleId, memberId, user) {
        const schedule = await this.courseScheduleRepository.findOne({
            where: { id: scheduleId },
            relations: ['course', 'coach', 'store'],
        });
        if (!schedule) {
            throw new common_1.NotFoundException('排课不存在');
        }
        if (!schedule.isAvailable()) {
            throw new common_1.BadRequestException('该排课不可预约');
        }
        if (schedule.isFull()) {
            throw new common_1.BadRequestException('该排课已满员');
        }
        const existingBooking = await this.bookingRepository.findOne({
            where: {
                courseScheduleId: scheduleId,
                memberId,
                status: 'confirmed',
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
        if (existingBooking) {
            throw new common_1.ConflictException('您已预约该课程');
        }
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
        schedule.addParticipant();
        await this.courseScheduleRepository.save(schedule);
        return savedBooking;
    }
    async cancelGroupClassBooking(bookingId, reason, user) {
        if (!user) {
            throw new common_1.UnauthorizedException('用户信息不能为空');
        }
        const booking = await this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: ['courseSchedule'],
        });
        if (!booking) {
            throw new common_1.NotFoundException('预约不存在');
        }
        if (!booking.isCancellable()) {
            throw new common_1.BadRequestException('预约无法取消（可能已开始或开始前3小时内）');
        }
        const success = booking.cancel(reason);
        if (!success) {
            throw new common_1.BadRequestException('预约取消失败');
        }
        booking.updatedAt = new Date();
        const savedBooking = await this.bookingRepository.save(booking);
        if (booking.courseSchedule) {
            booking.courseSchedule.removeParticipant();
            await this.courseScheduleRepository.save(booking.courseSchedule);
        }
        return savedBooking;
    }
    async getMemberBookings(memberId, queryDto, user) {
        const queryBuilder = this.createBaseQuery(user);
        queryBuilder.andWhere('booking.memberId = :memberId', { memberId });
        const { status, startDate, endDate, sortBy = 'startTime', sortOrder = 'DESC', } = queryDto;
        if (status) {
            queryBuilder.andWhere('booking.status = :status', { status });
        }
        if (startDate) {
            queryBuilder.andWhere('booking.startTime >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('booking.startTime <= :endDate', { endDate });
        }
        const validSortFields = ['startTime', 'endTime', 'status', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
        queryBuilder.orderBy(`booking.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
        const bookings = await queryBuilder.getMany();
        return bookings.map((booking) => ({
            ...booking,
            isGroupClass: booking.isGroupClass(),
            isPersonalTraining: booking.isPersonalTraining(),
            canCancel: booking.isCancellable(),
            canCheckIn: booking.isCharged() && !booking.isCheckedIn(),
        }));
    }
    async rescheduleBooking(bookingId, newStartTime, newEndTime, reason, user) {
        if (!user) {
            throw new common_1.BadRequestException('用户信息不能为空');
        }
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'booking', 'update');
        const booking = await this.findOne(bookingId, user);
        if (!['pending', 'confirmed'].includes(booking.status)) {
            throw new common_1.BadRequestException('当前状态不允许改期');
        }
        const now = new Date();
        const timeDiff = booking.startTime.getTime() - now.getTime();
        const hoursUntilBooking = timeDiff / (1000 * 60 * 60);
        if (hoursUntilBooking < 2) {
            throw new common_1.BadRequestException('预约开始前2小时内不允许改期');
        }
        await this.validateBookingTime({
            startTime: newStartTime,
            endTime: newEndTime,
            coachId: booking.coachId,
            memberId: booking.memberId,
            courseId: booking.courseId,
            storeId: booking.storeId,
        }, user || { storeId: '' }, bookingId);
        booking.startTime = newStartTime;
        booking.endTime = newEndTime;
        booking.updatedBy = user?.id;
        booking.updatedAt = new Date();
        if (reason) {
            booking.notes = `${booking.notes || ''}\n改期原因: ${reason}`;
        }
        return await this.bookingRepository.save(booking);
    }
    async getBookingsForReminder(reminderType, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'booking', 'read');
        const now = new Date();
        let startTime;
        let endTime;
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
    async getBookingAnalytics(startDate, endDate, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'booking', 'read');
        const baseQuery = this.createBaseQuery(user || { storeId: '' }, false).andWhere('booking.startTime BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        const totalBookings = await baseQuery.getCount();
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
        const completedCount = statusStats.find((s) => s.status === 'completed')?.count || 0;
        const cancelledCount = statusStats.find((s) => s.status === 'cancelled')?.count || 0;
        const noShowCount = statusStats.find((s) => s.status === 'no_show')?.count || 0;
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
        const coachPerformance = await this.bookingRepository
            .createQueryBuilder('booking')
            .leftJoin('booking.coach', 'coach')
            .select('booking.coachId', 'coachId')
            .addSelect('coach.name', 'coachName')
            .addSelect('COUNT(*)', 'bookings')
            .addSelect("ROUND(COUNT(CASE WHEN booking.status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2)", 'completionRate')
            .where('booking.startTime BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        })
            .andWhere('booking.deletedAt IS NULL')
            .groupBy('booking.coachId, coach.name')
            .orderBy('bookings', 'DESC')
            .getRawMany();
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
            completionRate: totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0,
            cancellationRate: totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0,
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
    async batchUpdateBookings(bookingIds, operation, reason, user) {
        (0, permission_util_1.checkPermission)(user?.roles?.[0]?.name || '', 'booking', 'update');
        let success = 0;
        let failed = 0;
        const errors = [];
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
            }
            catch (error) {
                failed++;
                errors.push(`预约 ${bookingId}: ${error.message}`);
            }
        }
        return { success, failed, errors };
    }
    async getConflictDetails(startTime, endTime, coachId, memberId, courseId, storeId, user) {
        const conflictResult = await this.checkConflicts({
            startTime,
            endTime,
            coachId,
            memberId,
            courseId,
            storeId,
        }, user || { storeId: '' });
        const conflicts = [];
        for (const booking of conflictResult.coachConflicts) {
            conflicts.push({
                type: 'coach',
                booking,
                message: `教练 ${booking.coach?.name} 在此时间段已有预约`,
            });
        }
        for (const booking of conflictResult.memberConflicts) {
            conflicts.push({
                type: 'member',
                booking,
                message: `会员 ${booking.member?.name} 在此时间段已有私教预约`,
            });
        }
        if (conflictResult.capacityConflicts.length > 0 && courseId) {
            const course = await this.courseRepository.findOne({
                where: { id: courseId },
            });
            if (course &&
                conflictResult.capacityConflicts.length >= course.capacity) {
                conflicts.push({
                    type: 'capacity',
                    booking: conflictResult.capacityConflicts[0],
                    message: `课程 ${course.name} 已达到最大容量 ${course.capacity} 人`,
                });
            }
        }
        return {
            hasConflicts: conflicts.length > 0,
            conflicts,
        };
    }
    async processExpiredBookings() {
        const now = new Date();
        const expiredBookings = await this.bookingRepository
            .createQueryBuilder('booking')
            .where('booking.status = :status', { status: 'pending' })
            .andWhere('booking.startTime < :now', { now })
            .andWhere('booking.deletedAt IS NULL')
            .getMany();
        let processed = 0;
        const errors = [];
        for (const booking of expiredBookings) {
            try {
                booking.status = 'cancelled';
                booking.notes = `${booking.notes || ''}\n系统自动取消：预约已过期`;
                booking.updatedAt = now;
                await this.bookingRepository.save(booking);
                processed++;
            }
            catch (error) {
                errors.push(`处理预约 ${booking.bookingNumber} 失败: ${error.message}`);
            }
        }
        return { processed, errors };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(course_schedule_entity_1.CourseSchedule)),
    __param(2, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(3, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __param(4, (0, typeorm_1.InjectRepository)(coach_entity_1.Coach)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map
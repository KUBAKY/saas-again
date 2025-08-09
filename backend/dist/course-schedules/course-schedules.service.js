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
exports.CourseSchedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_schedule_entity_1 = require("../entities/course-schedule.entity");
const course_entity_1 = require("../entities/course.entity");
const coach_entity_1 = require("../entities/coach.entity");
const store_entity_1 = require("../entities/store.entity");
let CourseSchedulesService = class CourseSchedulesService {
    courseScheduleRepository;
    courseRepository;
    coachRepository;
    storeRepository;
    constructor(courseScheduleRepository, courseRepository, coachRepository, storeRepository) {
        this.courseScheduleRepository = courseScheduleRepository;
        this.courseRepository = courseRepository;
        this.coachRepository = coachRepository;
        this.storeRepository = storeRepository;
    }
    async create(createDto, user) {
        const course = await this.courseRepository.findOne({
            where: { id: createDto.courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('课程不存在');
        }
        const coach = await this.coachRepository.findOne({
            where: { id: createDto.coachId },
        });
        if (!coach) {
            throw new common_1.NotFoundException('教练不存在');
        }
        const store = await this.storeRepository.findOne({
            where: { id: createDto.storeId },
        });
        if (!store) {
            throw new common_1.NotFoundException('门店不存在');
        }
        await this.checkTimeConflict(createDto.startTime, createDto.endTime, createDto.coachId, createDto.storeId);
        const startTime = new Date(createDto.startTime);
        const endTime = new Date(createDto.endTime);
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('开始时间必须早于结束时间');
        }
        if (startTime <= new Date()) {
            throw new common_1.BadRequestException('开始时间必须晚于当前时间');
        }
        const schedule = this.courseScheduleRepository.create({
            ...createDto,
            currentParticipants: 0,
            status: 'scheduled',
        });
        return await this.courseScheduleRepository.save(schedule);
    }
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, search, status, courseId, coachId, storeId, startDate, endDate, sortBy = 'startTime', sortOrder = 'ASC', } = queryDto;
        const queryBuilder = this.createBaseQuery(user);
        if (search) {
            queryBuilder.andWhere('(course.name LIKE :search OR coach.name LIKE :search)', { search: `%${search}%` });
        }
        if (status) {
            queryBuilder.andWhere('schedule.status = :status', { status });
        }
        if (courseId) {
            queryBuilder.andWhere('schedule.courseId = :courseId', { courseId });
        }
        if (coachId) {
            queryBuilder.andWhere('schedule.coachId = :coachId', { coachId });
        }
        if (storeId) {
            queryBuilder.andWhere('schedule.storeId = :storeId', { storeId });
        }
        if (startDate && endDate) {
            queryBuilder.andWhere('schedule.startTime BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            queryBuilder.andWhere('schedule.startTime >= :startDate', { startDate });
        }
        else if (endDate) {
            queryBuilder.andWhere('schedule.startTime <= :endDate', { endDate });
        }
        const validSortFields = ['startTime', 'endTime', 'status', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'startTime';
        queryBuilder.orderBy(`schedule.${sortField}`, sortOrder === 'DESC' ? 'DESC' : 'ASC');
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
    async findOne(id, user) {
        const schedule = await this.courseScheduleRepository.findOne({
            where: { id },
            relations: ['course', 'coach', 'store', 'bookings'],
        });
        if (!schedule) {
            throw new common_1.NotFoundException('排课不存在');
        }
        if (!user.hasRole('ADMIN') && !user.hasRole('SUPER_ADMIN')) {
            if (user.hasRole('STORE_MANAGER') && schedule.storeId !== user.storeId) {
                throw new common_1.ForbiddenException('无权访问其他门店的排课');
            }
            if (user.hasRole('COACH') && schedule.coachId !== user.id) {
                throw new common_1.ForbiddenException('无权访问其他教练的排课');
            }
        }
        return schedule;
    }
    async update(id, updateDto, user) {
        const schedule = await this.findOne(id, user);
        if (schedule.status === 'completed' || schedule.status === 'cancelled') {
            throw new common_1.BadRequestException('已完成或已取消的排课不能修改');
        }
        if (updateDto.startTime || updateDto.endTime) {
            const startTime = updateDto.startTime ? new Date(updateDto.startTime) : schedule.startTime;
            const endTime = updateDto.endTime ? new Date(updateDto.endTime) : schedule.endTime;
            if (startTime >= endTime) {
                throw new common_1.BadRequestException('开始时间必须早于结束时间');
            }
            await this.checkTimeConflict(startTime, endTime, updateDto.coachId || schedule.coachId, updateDto.storeId || schedule.storeId, id);
        }
        Object.assign(schedule, updateDto);
        schedule.updatedAt = new Date();
        return await this.courseScheduleRepository.save(schedule);
    }
    async cancel(id, reason, user) {
        const schedule = await this.findOne(id, user);
        if (!schedule.canCancel()) {
            throw new common_1.BadRequestException('排课无法取消（可能已开始或开始前3小时内）');
        }
        schedule.cancel(reason);
        schedule.updatedAt = new Date();
        return await this.courseScheduleRepository.save(schedule);
    }
    async complete(id, user) {
        const schedule = await this.findOne(id, user);
        if (schedule.status !== 'scheduled') {
            throw new common_1.BadRequestException('只有已安排的排课才能标记为完成');
        }
        schedule.complete();
        schedule.updatedAt = new Date();
        return await this.courseScheduleRepository.save(schedule);
    }
    async remove(id, user) {
        const schedule = await this.findOne(id, user);
        if (schedule.currentParticipants > 0) {
            throw new common_1.BadRequestException('有预约的排课不能删除');
        }
        schedule.deletedAt = new Date();
        await this.courseScheduleRepository.save(schedule);
    }
    async getStats(user) {
        const queryBuilder = this.createBaseQuery(user);
        const [total, scheduled, completed, cancelled] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder.clone().andWhere('schedule.status = :status', { status: 'scheduled' }).getCount(),
            queryBuilder.clone().andWhere('schedule.status = :status', { status: 'completed' }).getCount(),
            queryBuilder.clone().andWhere('schedule.status = :status', { status: 'cancelled' }).getCount(),
        ]);
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
    async getCalendarSchedules(query, user) {
        const { startDate, endDate, storeId, coachId } = query;
        const queryBuilder = this.createBaseQuery(user);
        if (startDate && endDate) {
            queryBuilder.andWhere('schedule.startTime BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (storeId) {
            queryBuilder.andWhere('schedule.storeId = :storeId', { storeId });
        }
        if (coachId) {
            queryBuilder.andWhere('schedule.coachId = :coachId', { coachId });
        }
        queryBuilder.orderBy('schedule.startTime', 'ASC');
        const schedules = await queryBuilder.getMany();
        return schedules.map(schedule => ({
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
    async checkTimeConflict(startTime, endTime, coachId, storeId, excludeId) {
        const queryBuilder = this.courseScheduleRepository
            .createQueryBuilder('schedule')
            .where('schedule.coachId = :coachId', { coachId })
            .andWhere('schedule.status = :status', { status: 'scheduled' })
            .andWhere('(schedule.startTime < :endTime AND schedule.endTime > :startTime)', { startTime, endTime });
        if (excludeId) {
            queryBuilder.andWhere('schedule.id != :excludeId', { excludeId });
        }
        const conflictingSchedule = await queryBuilder.getOne();
        if (conflictingSchedule) {
            throw new common_1.ConflictException('教练在该时间段已有其他排课');
        }
    }
    createBaseQuery(user) {
        const queryBuilder = this.courseScheduleRepository
            .createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.course', 'course')
            .leftJoinAndSelect('schedule.coach', 'coach')
            .leftJoinAndSelect('schedule.store', 'store')
            .where('schedule.deletedAt IS NULL');
        if (user.hasRole('STORE_MANAGER')) {
            queryBuilder.andWhere('schedule.storeId = :storeId', { storeId: user.storeId });
        }
        else if (user.hasRole('COACH')) {
            queryBuilder.andWhere('schedule.coachId = :coachId', { coachId: user.id });
        }
        return queryBuilder;
    }
    getStatusColor(status) {
        const colorMap = {
            scheduled: '#1890ff',
            completed: '#52c41a',
            cancelled: '#ff4d4f',
        };
        return colorMap[status] || '#d9d9d9';
    }
};
exports.CourseSchedulesService = CourseSchedulesService;
exports.CourseSchedulesService = CourseSchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_schedule_entity_1.CourseSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(2, (0, typeorm_1.InjectRepository)(coach_entity_1.Coach)),
    __param(3, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CourseSchedulesService);
//# sourceMappingURL=course-schedules.service.js.map
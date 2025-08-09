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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../entities/course.entity");
let CoursesService = class CoursesService {
    courseRepository;
    constructor(courseRepository) {
        this.courseRepository = courseRepository;
    }
    async create(createCourseDto, user) {
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法创建课程');
        }
        let storeId = createCourseDto.storeId;
        if (userRole === 'STORE_MANAGER' && user.storeId) {
            storeId = user.storeId;
        }
        const course = this.courseRepository.create({
            ...createCourseDto,
            storeId,
        });
        return await this.courseRepository.save(course);
    }
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, search, type, level, storeId, coachId, status, sortBy = 'createdAt', sortOrder = 'DESC', } = queryDto;
        const queryBuilder = this.createBaseQuery(user);
        if (search) {
            queryBuilder.andWhere('course.name ILIKE :search', {
                search: `%${search}%`,
            });
        }
        if (type) {
            queryBuilder.andWhere('course.type = :type', { type });
        }
        if (level) {
            queryBuilder.andWhere('course.level = :level', { level });
        }
        if (storeId) {
            queryBuilder.andWhere('course.storeId = :storeId', { storeId });
        }
        if (coachId) {
            queryBuilder.andWhere('course.coachId = :coachId', { coachId });
        }
        if (status) {
            queryBuilder.andWhere('course.status = :status', { status });
        }
        const validSortFields = [
            'name',
            'type',
            'price',
            'rating',
            'totalParticipants',
            'createdAt',
        ];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        queryBuilder.orderBy(`course.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [courses, total] = await queryBuilder.getManyAndCount();
        return {
            data: courses,
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
        queryBuilder.andWhere('course.id = :id', { id });
        const course = await queryBuilder.getOne();
        if (!course) {
            throw new common_1.NotFoundException('课程不存在');
        }
        return course;
    }
    async update(id, updateCourseDto, user) {
        const course = await this.findOne(id, user);
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法修改课程');
        }
        if (userRole === 'STORE_MANAGER' &&
            course.storeId !== user.storeId) {
            throw new common_1.ForbiddenException('权限不足，只能修改自己门店的课程');
        }
        Object.assign(course, updateCourseDto);
        course.updatedAt = new Date();
        return await this.courseRepository.save(course);
    }
    async updateStatus(id, status, user) {
        const course = await this.findOne(id, user);
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法修改课程状态');
        }
        course.status = status;
        course.updatedAt = new Date();
        return await this.courseRepository.save(course);
    }
    async remove(id, user) {
        const course = await this.findOne(id, user);
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法删除课程');
        }
        course.deletedAt = new Date();
        await this.courseRepository.save(course);
        return { message: '课程删除成功' };
    }
    async getStats(user) {
        const queryBuilder = this.createBaseQuery(user, false);
        const [total, active, inactive, personalTraining, groupClasses, workshops] = await Promise.all([
            queryBuilder.clone().getCount(),
            queryBuilder
                .clone()
                .andWhere('course.status = :status', { status: 'active' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('course.status = :status', { status: 'inactive' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('course.type = :type', { type: 'personal' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('course.type = :type', { type: 'group' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('course.type = :type', { type: 'workshop' })
                .getCount(),
        ]);
        const avgRatingResult = await queryBuilder
            .clone()
            .select('AVG(course.rating)', 'avgRating')
            .getRawOne();
        return {
            total,
            active,
            inactive,
            byType: {
                personal: personalTraining,
                group: groupClasses,
                workshop: workshops,
            },
            averageRating: parseFloat(avgRatingResult.avgRating) || 0,
        };
    }
    async getPopularCourses(limit, user) {
        const queryBuilder = this.createBaseQuery(user);
        queryBuilder
            .andWhere('course.status = :status', { status: 'active' })
            .andWhere('course.rating >= :minRating', { minRating: 4.0 })
            .orderBy('course.totalParticipants', 'DESC')
            .addOrderBy('course.rating', 'DESC')
            .take(limit);
        return await queryBuilder.getMany();
    }
    async getCourseBookings(id, query, user) {
        const course = await this.findOne(id, user);
        const { page = 1, limit = 20, status, startDate, endDate } = query;
        const queryBuilder = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.bookings', 'booking')
            .leftJoinAndSelect('booking.member', 'member')
            .leftJoinAndSelect('booking.coach', 'coach')
            .where('course.id = :id', { id });
        if (status) {
            queryBuilder.andWhere('booking.status = :status', { status });
        }
        if (startDate) {
            queryBuilder.andWhere('booking.startTime >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('booking.startTime <= :endDate', { endDate });
        }
        queryBuilder
            .orderBy('booking.startTime', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const result = await queryBuilder.getOne();
        const bookings = result?.bookings || [];
        return {
            data: bookings,
            meta: {
                page,
                limit,
                total: bookings.length,
                totalPages: Math.ceil(bookings.length / limit),
            },
        };
    }
    createBaseQuery(user, withRelations = true) {
        const queryBuilder = this.courseRepository.createQueryBuilder('course');
        if (withRelations) {
            queryBuilder
                .leftJoinAndSelect('course.store', 'store')
                .leftJoinAndSelect('course.coach', 'coach');
        }
        const userRole = user.roles?.[0]?.name || '';
        if (userRole === 'STORE_MANAGER' && user.storeId) {
            queryBuilder.andWhere('course.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        else if (userRole === 'BRAND_MANAGER' && user.brandId) {
            queryBuilder
                .leftJoin('course.store', 'filterStore')
                .andWhere('filterStore.brandId = :brandId', { brandId: user.brandId });
        }
        queryBuilder.andWhere('course.deletedAt IS NULL');
        return queryBuilder;
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CoursesService);
//# sourceMappingURL=courses.service.js.map
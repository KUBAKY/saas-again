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
exports.CoachesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coach_entity_1 = require("../entities/coach.entity");
const store_entity_1 = require("../entities/store.entity");
let CoachesService = class CoachesService {
    coachRepository;
    storeRepository;
    constructor(coachRepository, storeRepository) {
        this.coachRepository = coachRepository;
        this.storeRepository = storeRepository;
    }
    async create(createCoachDto, currentUser) {
        const { storeId, employeeNumber, phone, email } = createCoachDto;
        const store = await this.storeRepository.findOne({
            where: { id: storeId },
            relations: ['brand'],
        });
        if (!store) {
            throw new common_1.BadRequestException('门店不存在');
        }
        const canCreate = this.checkStorePermission(currentUser, store.brandId, storeId);
        if (!canCreate) {
            throw new common_1.ForbiddenException('无权限在此门店创建教练');
        }
        const existingCoachByNumber = await this.coachRepository.findOne({
            where: { employeeNumber },
        });
        if (existingCoachByNumber) {
            throw new common_1.ConflictException('员工编号已存在');
        }
        const existingCoachByPhone = await this.coachRepository.findOne({
            where: { phone, storeId },
        });
        if (existingCoachByPhone) {
            throw new common_1.ConflictException('该手机号在此门店已被使用');
        }
        if (email) {
            const existingCoachByEmail = await this.coachRepository.findOne({
                where: { email },
            });
            if (existingCoachByEmail) {
                throw new common_1.ConflictException('邮箱已被使用');
            }
        }
        const coach = this.coachRepository.create({
            ...createCoachDto,
            status: 'active',
            certifications: createCoachDto.certifications?.map(cert => ({
                name: cert,
                issuer: '待完善',
                issueDate: new Date().toISOString().split('T')[0],
            })),
        });
        return await this.coachRepository.save(coach);
    }
    async findAll(queryDto, currentUser) {
        const { page = 1, limit = 20, search, status, storeId, gender, specialty, minExperience, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
        const where = {};
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (status) {
            where.status = status;
        }
        if (gender) {
            where.gender = gender;
        }
        if (minExperience) {
        }
        if (currentUser.roles?.some(role => role.name === 'ADMIN')) {
            if (storeId) {
                where.storeId = storeId;
            }
        }
        else if (currentUser.roles?.some(role => role.name === 'BRAND_MANAGER')) {
            const stores = await this.storeRepository.find({
                where: { brandId: currentUser.brandId },
                select: ['id'],
            });
            const storeIds = stores.map(s => s.id);
            if (storeId && storeIds.includes(storeId)) {
                where.storeId = storeId;
            }
            else {
                const queryBuilder = this.coachRepository.createQueryBuilder('coach')
                    .leftJoinAndSelect('coach.store', 'store')
                    .where('coach.storeId IN (:...storeIds)', { storeIds })
                    .orderBy(`coach.${sortBy}`, sortOrder)
                    .skip((page - 1) * limit)
                    .take(limit);
                if (search) {
                    queryBuilder.andWhere('coach.name LIKE :search', { search: `%${search}%` });
                }
                if (status) {
                    queryBuilder.andWhere('coach.status = :status', { status });
                }
                if (gender) {
                    queryBuilder.andWhere('coach.gender = :gender', { gender });
                }
                if (specialty) {
                    queryBuilder.andWhere('coach.specialties LIKE :specialty', { specialty: `%${specialty}%` });
                }
                if (minExperience) {
                    queryBuilder.andWhere('coach.experienceYears >= :minExperience', { minExperience });
                }
                const [data, total] = await queryBuilder.getManyAndCount();
                return {
                    data,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }
        }
        else {
            if (currentUser.storeId) {
                where.storeId = currentUser.storeId;
            }
        }
        const queryBuilder = this.coachRepository.createQueryBuilder('coach')
            .leftJoinAndSelect('coach.store', 'store')
            .orderBy(`coach.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        if (where.storeId) {
            queryBuilder.andWhere('coach.storeId = :storeId', { storeId: where.storeId });
        }
        if (search) {
            queryBuilder.andWhere('coach.name LIKE :search', { search: `%${search}%` });
        }
        if (status) {
            queryBuilder.andWhere('coach.status = :status', { status });
        }
        if (gender) {
            queryBuilder.andWhere('coach.gender = :gender', { gender });
        }
        if (specialty) {
            queryBuilder.andWhere('coach.specialties LIKE :specialty', { specialty: `%${specialty}%` });
        }
        if (minExperience) {
            queryBuilder.andWhere('coach.experienceYears >= :minExperience', { minExperience });
        }
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, currentUser) {
        const coach = await this.coachRepository.findOne({
            where: { id },
            relations: ['store', 'store.brand'],
        });
        if (!coach) {
            throw new common_1.NotFoundException('教练不存在');
        }
        const canView = this.checkStorePermission(currentUser, coach.store.brandId, coach.storeId);
        if (!canView) {
            throw new common_1.ForbiddenException('无权限查看此教练');
        }
        return coach;
    }
    async update(id, updateCoachDto, currentUser) {
        const coach = await this.findOne(id, currentUser);
        const canUpdate = this.checkStorePermission(currentUser, coach.store.brandId, coach.storeId);
        if (!canUpdate) {
            throw new common_1.ForbiddenException('无权限更新此教练');
        }
        if (updateCoachDto.phone && updateCoachDto.phone !== coach.phone) {
            const existingCoach = await this.coachRepository.findOne({
                where: { phone: updateCoachDto.phone, storeId: coach.storeId },
            });
            if (existingCoach) {
                throw new common_1.ConflictException('该手机号在此门店已被使用');
            }
        }
        if (updateCoachDto.email && updateCoachDto.email !== coach.email) {
            const existingCoach = await this.coachRepository.findOne({
                where: { email: updateCoachDto.email },
            });
            if (existingCoach) {
                throw new common_1.ConflictException('邮箱已被使用');
            }
        }
        Object.assign(coach, updateCoachDto);
        coach.updatedAt = new Date();
        return await this.coachRepository.save(coach);
    }
    async remove(id, currentUser) {
        const coach = await this.findOne(id, currentUser);
        const canDelete = currentUser.roles?.some(role => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && currentUser.brandId === coach.store.brandId));
        if (!canDelete) {
            throw new common_1.ForbiddenException('无权限删除此教练');
        }
        coach.status = 'inactive';
        coach.deletedAt = new Date();
        await this.coachRepository.save(coach);
    }
    async getStats(currentUser) {
        let storeIds = [];
        if (currentUser.roles?.some(role => role.name === 'ADMIN')) {
            const stores = await this.storeRepository.find({ select: ['id'] });
            storeIds = stores.map(s => s.id);
        }
        else if (currentUser.roles?.some(role => role.name === 'BRAND_MANAGER')) {
            const stores = await this.storeRepository.find({
                where: { brandId: currentUser.brandId },
                select: ['id'],
            });
            storeIds = stores.map(s => s.id);
        }
        else {
            storeIds = currentUser.storeId ? [currentUser.storeId] : [];
        }
        if (storeIds.length === 0) {
            return {
                totalCoaches: 0,
                activeCoaches: 0,
                inactiveCoaches: 0,
                averageExperience: 0,
                coachesBySpecialty: {},
            };
        }
        const totalCoaches = await this.coachRepository
            .createQueryBuilder('coach')
            .where('coach.storeId IN (:...storeIds)', { storeIds })
            .getCount();
        const activeCoaches = await this.coachRepository
            .createQueryBuilder('coach')
            .where('coach.storeId IN (:...storeIds)', { storeIds })
            .andWhere('coach.status = :status', { status: 'active' })
            .getCount();
        const avgResult = await this.coachRepository
            .createQueryBuilder('coach')
            .select('AVG(coach.experienceYears)', 'avg')
            .where('coach.storeId IN (:...storeIds)', { storeIds })
            .andWhere('coach.experienceYears IS NOT NULL')
            .getRawOne();
        const averageExperience = avgResult?.avg ? parseFloat(avgResult.avg).toFixed(1) : 0;
        return {
            totalCoaches,
            activeCoaches,
            inactiveCoaches: totalCoaches - activeCoaches,
            averageExperience: parseFloat(averageExperience),
            coachesBySpecialty: await this.getCoachesBySpecialty(storeIds),
        };
    }
    checkStorePermission(user, brandId, storeId) {
        return user.roles?.some(role => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === brandId) ||
            (user.brandId === brandId && (!user.storeId || user.storeId === storeId))) || false;
    }
    async getCoachesBySpecialty(storeIds) {
        const coaches = await this.coachRepository
            .createQueryBuilder('coach')
            .select('coach.specialties')
            .where('coach.storeId IN (:...storeIds)', { storeIds })
            .andWhere('coach.specialties IS NOT NULL')
            .getMany();
        const specialtyCount = {};
        coaches.forEach(coach => {
            if (coach.specialties) {
                coach.specialties.forEach(specialty => {
                    specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
                });
            }
        });
        return specialtyCount;
    }
};
exports.CoachesService = CoachesService;
exports.CoachesService = CoachesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coach_entity_1.Coach)),
    __param(1, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CoachesService);
//# sourceMappingURL=coaches.service.js.map
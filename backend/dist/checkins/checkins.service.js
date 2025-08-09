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
exports.CheckInsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const check_in_entity_1 = require("../entities/check-in.entity");
let CheckInsService = class CheckInsService {
    checkInRepository;
    constructor(checkInRepository) {
        this.checkInRepository = checkInRepository;
    }
    async create(createCheckInDto, user) {
        let storeId = createCheckInDto.storeId;
        if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
            storeId = user.storeId;
        }
        await this.checkDuplicateCheckIn(createCheckInDto.memberId, storeId);
        let method = 'app';
        if (createCheckInDto.checkInMethod === 'manual') {
            method = 'manual';
        }
        else if (createCheckInDto.checkInMethod === 'qr_code') {
            method = 'qr_code';
        }
        else if (createCheckInDto.checkInMethod === 'facial_recognition') {
            method = 'app';
        }
        const checkIn = this.checkInRepository.create({
            memberId: createCheckInDto.memberId,
            storeId,
            method,
            deviceInfo: createCheckInDto.deviceInfo,
            notes: createCheckInDto.notes,
            checkInTime: new Date(),
        });
        return await this.checkInRepository.save(checkIn);
    }
    async checkInByQRCode(qrCode, memberId, user) {
        const qrData = this.parseQRCode(qrCode);
        if (!qrData.valid) {
            throw new common_1.BadRequestException('二维码无效或已过期');
        }
        if (!qrData.storeId) {
            throw new common_1.BadRequestException('二维码中缺少门店信息');
        }
        const createCheckInDto = {
            memberId,
            storeId: qrData.storeId,
            checkInMethod: 'qr_code',
            deviceInfo: qrData.deviceInfo,
            notes: '二维码签到',
        };
        return await this.create(createCheckInDto, user);
    }
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, memberId, storeId, startDate, endDate, sortBy = 'checkInTime', sortOrder = 'DESC', } = queryDto;
        const queryBuilder = this.createBaseQuery(user);
        if (memberId) {
            queryBuilder.andWhere('checkin.memberId = :memberId', { memberId });
        }
        if (storeId) {
            queryBuilder.andWhere('checkin.storeId = :storeId', { storeId });
        }
        if (startDate) {
            queryBuilder.andWhere('checkin.checkInTime >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('checkin.checkInTime <= :endDate', { endDate });
        }
        const validSortFields = ['checkInTime', 'method', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'checkInTime';
        queryBuilder.orderBy(`checkin.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
        const offset = (page - 1) * limit;
        queryBuilder.skip(offset).take(limit);
        const [checkIns, total] = await queryBuilder.getManyAndCount();
        return {
            data: checkIns,
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
        queryBuilder.andWhere('checkin.id = :id', { id });
        const checkIn = await queryBuilder.getOne();
        if (!checkIn) {
            throw new common_1.NotFoundException('签到记录不存在');
        }
        return checkIn;
    }
    async update(id, updateCheckInDto, user) {
        const checkIn = await this.findOne(id, user);
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法修改签到记录');
        }
        Object.assign(checkIn, updateCheckInDto);
        checkIn.updatedAt = new Date();
        return await this.checkInRepository.save(checkIn);
    }
    async remove(id, user) {
        const checkIn = await this.findOne(id, user);
        const userRole = user.roles?.[0]?.name || '';
        if (!['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)) {
            throw new common_1.ForbiddenException('权限不足，无法删除签到记录');
        }
        checkIn.deletedAt = new Date();
        await this.checkInRepository.save(checkIn);
        return { message: '签到记录删除成功' };
    }
    async getStats(user) {
        const queryBuilder = this.createBaseQuery(user, false);
        const total = await queryBuilder.clone().getCount();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayCount = await queryBuilder
            .clone()
            .andWhere('checkin.checkInTime >= :today', { today })
            .andWhere('checkin.checkInTime < :tomorrow', { tomorrow })
            .getCount();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        const weekCount = await queryBuilder
            .clone()
            .andWhere('checkin.checkInTime >= :weekStart', { weekStart })
            .andWhere('checkin.checkInTime < :weekEnd', { weekEnd })
            .getCount();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const monthCount = await queryBuilder
            .clone()
            .andWhere('checkin.checkInTime >= :monthStart', { monthStart })
            .andWhere('checkin.checkInTime < :monthEnd', { monthEnd })
            .getCount();
        const [manual, qrCode, facial] = await Promise.all([
            queryBuilder
                .clone()
                .andWhere('checkin.method = :method', { method: 'manual' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('checkin.method = :method', { method: 'qr_code' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('checkin.method = :method', {
                method: 'facial_recognition',
            })
                .getCount(),
        ]);
        return {
            total,
            today: todayCount,
            week: weekCount,
            month: monthCount,
            byMethod: {
                manual,
                qrCode,
                facial,
            },
        };
    }
    async getTodayCheckIns(storeId, user) {
        const queryBuilder = this.createBaseQuery(user);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        queryBuilder
            .andWhere('checkin.checkInTime >= :today', { today })
            .andWhere('checkin.checkInTime < :tomorrow', { tomorrow });
        if (storeId) {
            queryBuilder.andWhere('checkin.storeId = :storeId', { storeId });
        }
        queryBuilder.orderBy('checkin.checkInTime', 'DESC');
        return await queryBuilder.getMany();
    }
    createBaseQuery(user, withRelations = true) {
        const queryBuilder = this.checkInRepository.createQueryBuilder('checkin');
        if (withRelations) {
            queryBuilder
                .leftJoinAndSelect('checkin.member', 'member')
                .leftJoinAndSelect('checkin.store', 'store');
        }
        if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
            queryBuilder.andWhere('checkin.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        else if (user.roles?.[0]?.name === 'BRAND_MANAGER' && user.brandId) {
            queryBuilder
                .leftJoin('checkin.store', 'filterStore')
                .andWhere('filterStore.brandId = :brandId', { brandId: user.brandId });
        }
        queryBuilder.andWhere('checkin.deletedAt IS NULL');
        return queryBuilder;
    }
    async checkDuplicateCheckIn(memberId, storeId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const existingCheckIn = await this.checkInRepository.findOne({
            where: {
                memberId,
                storeId,
                checkInTime: (0, typeorm_2.Between)(today, tomorrow),
                deletedAt: (0, typeorm_2.IsNull)(),
            },
        });
        if (existingCheckIn) {
            throw new common_1.ConflictException('今日已签到，请勿重复签到');
        }
    }
    parseQRCode(qrCode) {
        try {
            const data = JSON.parse(Buffer.from(qrCode, 'base64').toString());
            const now = new Date().getTime();
            const qrTime = new Date(data.timestamp).getTime();
            const validDuration = 5 * 60 * 1000;
            if (now - qrTime > validDuration) {
                return { valid: false };
            }
            return {
                valid: true,
                storeId: data.storeId,
                deviceInfo: data.deviceInfo,
            };
        }
        catch (error) {
            return { valid: false };
        }
    }
};
exports.CheckInsService = CheckInsService;
exports.CheckInsService = CheckInsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(check_in_entity_1.CheckIn)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CheckInsService);
//# sourceMappingURL=checkins.service.js.map
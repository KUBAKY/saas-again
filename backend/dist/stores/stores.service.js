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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const store_entity_1 = require("../entities/store.entity");
const brand_entity_1 = require("../entities/brand.entity");
let StoresService = class StoresService {
    storeRepository;
    brandRepository;
    constructor(storeRepository, brandRepository) {
        this.storeRepository = storeRepository;
        this.brandRepository = brandRepository;
    }
    async create(createStoreDto, user) {
        const { brandId, code } = createStoreDto;
        const brand = await this.brandRepository.findOne({
            where: { id: brandId },
        });
        if (!brand) {
            throw new common_1.BadRequestException('品牌不存在');
        }
        const canCreate = user.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === brandId));
        if (!canCreate) {
            throw new common_1.ForbiddenException('无权限为此品牌创建门店');
        }
        const existingStore = await this.storeRepository.findOne({
            where: { code, brandId },
        });
        if (existingStore) {
            throw new common_1.ConflictException('门店编码在该品牌内已存在');
        }
        const store = this.storeRepository.create({
            ...createStoreDto,
            status: 'active',
        });
        return await this.storeRepository.save(store);
    }
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, search, status, brandId, city, sortBy = 'createdAt', sortOrder = 'DESC', } = queryDto;
        const where = {};
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (status) {
            where.status = status;
        }
        if (city) {
            where.address = (0, typeorm_2.Like)(`%${city}%`);
        }
        if (user.roles?.some((role) => role.name === 'ADMIN')) {
            if (brandId) {
                where.brandId = brandId;
            }
        }
        else if (user.roles?.some((role) => role.name === 'BRAND_MANAGER')) {
            where.brandId = user.brandId;
        }
        else {
            where.brandId = user.brandId;
            if (user.storeId) {
                where.id = user.storeId;
            }
        }
        const findOptions = {
            where,
            order: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['brand'],
        };
        const [data, total] = await this.storeRepository.findAndCount(findOptions);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, user) {
        const store = await this.storeRepository.findOne({
            where: { id },
            relations: ['brand'],
        });
        if (!store) {
            throw new common_1.NotFoundException('门店不存在');
        }
        const canView = user.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === store.brandId) ||
            (user.brandId === store.brandId &&
                (!user.storeId || user.storeId === store.id)));
        if (!canView) {
            throw new common_1.ForbiddenException('无权限查看此门店');
        }
        return store;
    }
    async update(id, updateStoreDto, user) {
        const store = await this.findOne(id, user);
        const canUpdate = user.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === store.brandId) ||
            (role.name === 'STORE_MANAGER' && user.storeId === store.id));
        if (!canUpdate) {
            throw new common_1.ForbiddenException('无权限更新此门店');
        }
        Object.assign(store, updateStoreDto);
        store.updatedAt = new Date();
        return await this.storeRepository.save(store);
    }
    async remove(id, user) {
        const store = await this.findOne(id, user);
        const canDelete = user.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === store.brandId));
        if (!canDelete) {
            throw new common_1.ForbiddenException('无权限删除此门店');
        }
        store.status = 'inactive';
        store.deletedAt = new Date();
        await this.storeRepository.save(store);
    }
    async getStats(id, user) {
        const store = await this.findOne(id, user);
        return {
            id: store.id,
            name: store.name,
            address: store.address,
            phone: store.phone,
            openTime: store.openTime,
            closeTime: store.closeTime,
            status: store.status,
            createdAt: store.createdAt,
            facilities: store.facilities || [],
            memberCount: 0,
            coachCount: 0,
            courseCount: 0,
        };
    }
    async findByBrand(brandId, user) {
        const canView = user.roles?.some((role) => role.name === 'ADMIN' || user.brandId === brandId);
        if (!canView) {
            throw new common_1.ForbiddenException('无权限查看此品牌的门店');
        }
        return await this.storeRepository.find({
            where: { brandId, status: 'active' },
            relations: ['brand'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StoresService);
//# sourceMappingURL=stores.service.js.map
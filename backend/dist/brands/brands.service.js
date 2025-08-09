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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_entity_1 = require("../entities/brand.entity");
let BrandsService = class BrandsService {
    brandRepository;
    constructor(brandRepository) {
        this.brandRepository = brandRepository;
    }
    async create(createBrandDto, user) {
        const isAdmin = user.roles?.some((role) => role.name === 'ADMIN');
        if (!isAdmin) {
            throw new common_1.ForbiddenException('只有系统管理员可以创建品牌');
        }
        const existingBrand = await this.brandRepository.findOne({
            where: { code: createBrandDto.code },
        });
        if (existingBrand) {
            throw new common_1.ConflictException('品牌编码已存在');
        }
        const brand = this.brandRepository.create({
            ...createBrandDto,
            status: 'active',
        });
        return await this.brandRepository.save(brand);
    }
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'DESC', } = queryDto;
        const where = {};
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (status) {
            where.status = status;
        }
        if (!user.roles?.some((role) => role.name === 'ADMIN')) {
            where.id = user.brandId;
        }
        const findOptions = {
            where,
            order: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['stores'],
        };
        const [data, total] = await this.brandRepository.findAndCount(findOptions);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, user) {
        const brand = await this.brandRepository.findOne({
            where: { id },
            relations: ['stores'],
        });
        if (!brand) {
            throw new common_1.NotFoundException('品牌不存在');
        }
        if (!user.roles?.some((role) => role.name === 'ADMIN') &&
            brand.id !== user.brandId) {
            throw new common_1.ForbiddenException('无权限查看此品牌');
        }
        return brand;
    }
    async update(id, updateBrandDto, user) {
        const brand = await this.findOne(id, user);
        const canUpdate = user.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === brand.id));
        if (!canUpdate) {
            throw new common_1.ForbiddenException('无权限更新此品牌');
        }
        Object.assign(brand, updateBrandDto);
        brand.updatedAt = new Date();
        return await this.brandRepository.save(brand);
    }
    async remove(id, user) {
        const brand = await this.findOne(id, user);
        if (!user.roles?.some((role) => role.name === 'ADMIN')) {
            throw new common_1.ForbiddenException('只有系统管理员可以删除品牌');
        }
        brand.status = 'inactive';
        brand.deletedAt = new Date();
        await this.brandRepository.save(brand);
    }
    async getStats(id, user) {
        const brand = await this.findOne(id, user);
        const storeCount = brand.stores?.length || 0;
        const activeStoreCount = brand.stores?.filter((store) => store.status === 'active').length || 0;
        return {
            storeCount,
            activeStoreCount,
            createdAt: brand.createdAt,
            status: brand.status,
        };
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BrandsService);
//# sourceMappingURL=brands.service.js.map
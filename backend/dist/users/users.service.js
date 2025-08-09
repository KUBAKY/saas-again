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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
const brand_entity_1 = require("../entities/brand.entity");
const store_entity_1 = require("../entities/store.entity");
let UsersService = class UsersService {
    userRepository;
    roleRepository;
    brandRepository;
    storeRepository;
    constructor(userRepository, roleRepository, brandRepository, storeRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.brandRepository = brandRepository;
        this.storeRepository = storeRepository;
    }
    async create(createUserDto, currentUser) {
        const { brandId, storeId, roleIds, email, username, phone } = createUserDto;
        const canCreate = currentUser.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && currentUser.brandId === brandId));
        if (!canCreate) {
            throw new common_1.ForbiddenException('无权限创建用户');
        }
        const brand = await this.brandRepository.findOne({
            where: { id: brandId },
        });
        if (!brand) {
            throw new common_1.BadRequestException('品牌不存在');
        }
        if (storeId) {
            const store = await this.storeRepository.findOne({
                where: { id: storeId, brandId },
            });
            if (!store) {
                throw new common_1.BadRequestException('门店不存在或不属于指定品牌');
            }
        }
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }, ...(phone ? [{ phone, brandId }] : [])],
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('邮箱已被使用');
            }
            if (existingUser.username === username) {
                throw new common_1.ConflictException('用户名已被使用');
            }
            if (existingUser.phone === phone && existingUser.brandId === brandId) {
                throw new common_1.ConflictException('手机号在该品牌内已被使用');
            }
        }
        let roles = [];
        if (roleIds && roleIds.length > 0) {
            roles = await this.roleRepository.find({
                where: { id: (0, typeorm_2.In)(roleIds) },
            });
            if (roles.length !== roleIds.length) {
                throw new common_1.BadRequestException('部分角色不存在');
            }
        }
        const user = this.userRepository.create({
            ...createUserDto,
            roles,
        });
        return await this.userRepository.save(user);
    }
    async findAll(queryDto, currentUser) {
        const { page = 1, limit = 20, search, status, brandId, storeId, roleName, sortBy = 'createdAt', sortOrder = 'DESC', } = queryDto;
        const where = {};
        if (search) {
            where.username = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (status) {
            where.status = status;
        }
        if (currentUser.roles?.some((role) => role.name === 'ADMIN')) {
            if (brandId) {
                where.brandId = brandId;
            }
            if (storeId) {
                where.storeId = storeId;
            }
        }
        else if (currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER')) {
            where.brandId = currentUser.brandId;
            if (storeId) {
                where.storeId = storeId;
            }
        }
        else {
            where.brandId = currentUser.brandId;
            if (currentUser.storeId) {
                where.storeId = currentUser.storeId;
            }
        }
        const findOptions = {
            where,
            order: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
            relations: ['roles', 'brand', 'store'],
        };
        let [data, total] = await this.userRepository.findAndCount(findOptions);
        if (roleName) {
            data = data.filter((user) => user.roles?.some((role) => role.name === roleName));
            total = data.length;
        }
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles', 'brand', 'store'],
        });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        const canView = currentUser.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' &&
                currentUser.brandId === user.brandId) ||
            (currentUser.brandId === user.brandId &&
                (!currentUser.storeId || currentUser.storeId === user.storeId)) ||
            currentUser.id === user.id);
        if (!canView) {
            throw new common_1.ForbiddenException('无权限查看此用户');
        }
        return user;
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.findOne(id, currentUser);
        const canUpdate = currentUser.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' &&
                currentUser.brandId === user.brandId) ||
            currentUser.id === user.id);
        if (!canUpdate) {
            throw new common_1.ForbiddenException('无权限更新此用户');
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('邮箱已被使用');
            }
        }
        if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
            const existingUser = await this.userRepository.findOne({
                where: { phone: updateUserDto.phone, brandId: user.brandId },
            });
            if (existingUser) {
                throw new common_1.ConflictException('手机号在该品牌内已被使用');
            }
        }
        if (updateUserDto.roleIds) {
            const roles = await this.roleRepository.find({
                where: { id: (0, typeorm_2.In)(updateUserDto.roleIds) },
            });
            if (roles.length !== updateUserDto.roleIds.length) {
                throw new common_1.BadRequestException('部分角色不存在');
            }
            user.roles = roles;
        }
        Object.assign(user, updateUserDto);
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
    }
    async updateStatus(id, updateStatusDto, currentUser) {
        const user = await this.findOne(id, currentUser);
        const canUpdateStatus = currentUser.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && currentUser.brandId === user.brandId));
        if (!canUpdateStatus) {
            throw new common_1.ForbiddenException('无权限更新用户状态');
        }
        user.status = updateStatusDto.status;
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
    }
    async updateRoles(id, updateRolesDto, currentUser) {
        const user = await this.findOne(id, currentUser);
        const canUpdateRoles = currentUser.roles?.some((role) => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && currentUser.brandId === user.brandId));
        if (!canUpdateRoles) {
            throw new common_1.ForbiddenException('无权限更新用户角色');
        }
        const roles = await this.roleRepository.find({
            where: { id: (0, typeorm_2.In)(updateRolesDto.roleIds) },
        });
        if (roles.length !== updateRolesDto.roleIds.length) {
            throw new common_1.BadRequestException('部分角色不存在');
        }
        user.roles = roles;
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
    }
    async remove(id, currentUser) {
        const user = await this.findOne(id, currentUser);
        if (!currentUser.roles?.some((role) => role.name === 'ADMIN')) {
            throw new common_1.ForbiddenException('只有系统管理员可以删除用户');
        }
        if (currentUser.id === user.id) {
            throw new common_1.BadRequestException('不能删除自己');
        }
        user.status = 'inactive';
        user.deletedAt = new Date();
        await this.userRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(3, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map
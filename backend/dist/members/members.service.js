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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const member_entity_1 = require("../entities/member.entity");
const store_entity_1 = require("../entities/store.entity");
let MembersService = class MembersService {
    memberRepository;
    storeRepository;
    constructor(memberRepository, storeRepository) {
        this.memberRepository = memberRepository;
        this.storeRepository = storeRepository;
    }
    async create(createMemberDto, currentUser) {
        const { storeId, phone } = createMemberDto;
        const store = await this.storeRepository.findOne({
            where: { id: storeId },
            relations: ['brand'],
        });
        if (!store) {
            throw new common_1.BadRequestException('门店不存在');
        }
        const canCreate = this.checkStorePermission(currentUser, store.brandId, storeId);
        if (!canCreate) {
            throw new common_1.ForbiddenException('无权限在此门店创建会员');
        }
        const existingMember = await this.memberRepository.findOne({
            where: { phone, storeId },
        });
        if (existingMember) {
            throw new common_1.ConflictException('该手机号在此门店已注册');
        }
        const memberNumber = await this.generateMemberNumber();
        const member = this.memberRepository.create({
            ...createMemberDto,
            memberNumber,
            status: 'active',
            points: 0,
        });
        return await this.memberRepository.save(member);
    }
    async findAll(queryDto, currentUser) {
        const { page = 1, limit = 20, search, status, storeId, level, gender, minAge, maxAge, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
        const where = {};
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (status) {
            where.status = status;
        }
        if (level) {
            where.level = level;
        }
        if (gender) {
            where.gender = gender;
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
            }
        }
        else {
            if (currentUser.storeId) {
                where.storeId = currentUser.storeId;
            }
        }
        let findOptions;
        if (currentUser.roles?.some(role => role.name === 'BRAND_MANAGER') && !storeId) {
            const stores = await this.storeRepository.find({
                where: { brandId: currentUser.brandId },
                select: ['id'],
            });
            const storeIds = stores.map(s => s.id);
            findOptions = {
                where: {
                    ...where,
                    storeId: storeIds.length > 0 ? storeIds[0] : undefined,
                },
                order: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                relations: ['store'],
            };
            const queryBuilder = this.memberRepository.createQueryBuilder('member')
                .leftJoinAndSelect('member.store', 'store')
                .where('member.storeId IN (:...storeIds)', { storeIds })
                .orderBy(`member.${sortBy}`, sortOrder)
                .skip((page - 1) * limit)
                .take(limit);
            if (search) {
                queryBuilder.andWhere('member.name LIKE :search', { search: `%${search}%` });
            }
            if (status) {
                queryBuilder.andWhere('member.status = :status', { status });
            }
            if (level) {
                queryBuilder.andWhere('member.level = :level', { level });
            }
            if (gender) {
                queryBuilder.andWhere('member.gender = :gender', { gender });
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
        else {
            findOptions = {
                where,
                order: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
                relations: ['store'],
            };
            const [data, total] = await this.memberRepository.findAndCount(findOptions);
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
    }
    async findOne(id, currentUser) {
        const member = await this.memberRepository.findOne({
            where: { id },
            relations: ['store', 'store.brand'],
        });
        if (!member) {
            throw new common_1.NotFoundException('会员不存在');
        }
        const canView = this.checkStorePermission(currentUser, member.store.brandId, member.storeId);
        if (!canView) {
            throw new common_1.ForbiddenException('无权限查看此会员');
        }
        return member;
    }
    async update(id, updateMemberDto, currentUser) {
        const member = await this.findOne(id, currentUser);
        const canUpdate = this.checkStorePermission(currentUser, member.store.brandId, member.storeId);
        if (!canUpdate) {
            throw new common_1.ForbiddenException('无权限更新此会员');
        }
        if (updateMemberDto.phone && updateMemberDto.phone !== member.phone) {
            const existingMember = await this.memberRepository.findOne({
                where: { phone: updateMemberDto.phone, storeId: member.storeId },
            });
            if (existingMember) {
                throw new common_1.ConflictException('该手机号在此门店已被使用');
            }
        }
        Object.assign(member, updateMemberDto);
        member.updatedAt = new Date();
        return await this.memberRepository.save(member);
    }
    async remove(id, currentUser) {
        const member = await this.findOne(id, currentUser);
        const canDelete = currentUser.roles?.some(role => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && currentUser.brandId === member.store.brandId));
        if (!canDelete) {
            throw new common_1.ForbiddenException('无权限删除此会员');
        }
        member.status = 'inactive';
        member.deletedAt = new Date();
        await this.memberRepository.save(member);
    }
    async getStats(currentUser) {
        let whereCondition = {};
        if (currentUser.roles?.some(role => role.name === 'ADMIN')) {
        }
        else if (currentUser.roles?.some(role => role.name === 'BRAND_MANAGER')) {
            const stores = await this.storeRepository.find({
                where: { brandId: currentUser.brandId },
                select: ['id'],
            });
            const storeIds = stores.map(s => s.id);
            const totalMembers = await this.memberRepository
                .createQueryBuilder('member')
                .where('member.storeId IN (:...storeIds)', { storeIds })
                .getCount();
            const activeMembers = await this.memberRepository
                .createQueryBuilder('member')
                .where('member.storeId IN (:...storeIds)', { storeIds })
                .andWhere('member.status = :status', { status: 'active' })
                .getCount();
            const newMembersThisMonth = await this.memberRepository
                .createQueryBuilder('member')
                .where('member.storeId IN (:...storeIds)', { storeIds })
                .andWhere('member.createdAt >= :startDate', {
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            })
                .getCount();
            return {
                totalMembers,
                activeMembers,
                inactiveMembers: totalMembers - activeMembers,
                newMembersThisMonth,
                membersByLevel: await this.getMembersByLevel(storeIds),
            };
        }
        else {
            whereCondition = { storeId: currentUser.storeId };
            const totalMembers = await this.memberRepository.count({ where: whereCondition });
            const activeMembers = await this.memberRepository.count({
                where: { ...whereCondition, status: 'active' }
            });
            const newMembersThisMonth = await this.memberRepository.count({
                where: {
                    ...whereCondition,
                    createdAt: (0, typeorm_2.Between)(new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date())
                }
            });
            return {
                totalMembers,
                activeMembers,
                inactiveMembers: totalMembers - activeMembers,
                newMembersThisMonth,
                membersByLevel: await this.getMembersByLevel([currentUser.storeId]),
            };
        }
    }
    async generateMemberNumber() {
        const year = new Date().getFullYear();
        const count = await this.memberRepository.count();
        return `M${year}${(count + 1).toString().padStart(6, '0')}`;
    }
    checkStorePermission(user, brandId, storeId) {
        return user.roles?.some(role => role.name === 'ADMIN' ||
            (role.name === 'BRAND_MANAGER' && user.brandId === brandId) ||
            (user.brandId === brandId && (!user.storeId || user.storeId === storeId))) || false;
    }
    async getMembersByLevel(storeIds) {
        const result = await this.memberRepository
            .createQueryBuilder('member')
            .select('member.level', 'level')
            .addSelect('COUNT(*)', 'count')
            .where('member.storeId IN (:...storeIds)', { storeIds })
            .groupBy('member.level')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.level] = parseInt(item.count);
            return acc;
        }, {});
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __param(1, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MembersService);
//# sourceMappingURL=members.service.js.map
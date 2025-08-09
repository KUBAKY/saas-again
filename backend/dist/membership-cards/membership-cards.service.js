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
exports.MembershipCardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const membership_card_entity_1 = require("../entities/membership-card.entity");
const member_entity_1 = require("../entities/member.entity");
const permission_util_1 = require("../common/utils/permission.util");
let MembershipCardsService = class MembershipCardsService {
    membershipCardRepository;
    memberRepository;
    constructor(membershipCardRepository, memberRepository) {
        this.membershipCardRepository = membershipCardRepository;
        this.memberRepository = memberRepository;
    }
    async create(createMembershipCardDto, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'create');
        const member = await this.memberRepository.findOne({
            where: { id: createMembershipCardDto.memberId },
            relations: ['store'],
        });
        if (!member) {
            throw new common_1.NotFoundException('会员不存在');
        }
        const membershipCard = this.membershipCardRepository.create({
            ...createMembershipCardDto,
            member,
            createdBy: user.id,
        });
        return await this.membershipCardRepository.save(membershipCard);
    }
    async findAll(queryDto, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const { page = 1, limit = 10, memberId, cardType, status, storeId, } = queryDto;
        const queryBuilder = this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .leftJoinAndSelect('membershipCard.member', 'member')
            .where('membershipCard.brandId = :brandId', { brandId: user.brandId });
        if (user.storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        else if (storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', { storeId });
        }
        if (memberId) {
            queryBuilder.andWhere('membershipCard.memberId = :memberId', {
                memberId,
            });
        }
        if (cardType) {
            queryBuilder.andWhere('membershipCard.cardType = :cardType', {
                cardType,
            });
        }
        if (status) {
            queryBuilder.andWhere('membershipCard.status = :status', { status });
        }
        const [items, total] = await queryBuilder
            .orderBy('membershipCard.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const queryBuilder = this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .leftJoinAndSelect('membershipCard.member', 'member')
            .where('membershipCard.id = :id', { id })
            .andWhere('membershipCard.brandId = :brandId', { brandId: user.brandId });
        if (user.storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        const membershipCard = await queryBuilder.getOne();
        if (!membershipCard) {
            throw new common_1.NotFoundException('会员卡不存在');
        }
        return membershipCard;
    }
    async update(id, updateMembershipCardDto, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(id, user);
        Object.assign(membershipCard, updateMembershipCardDto);
        membershipCard.updatedBy = user.id;
        return await this.membershipCardRepository.save(membershipCard);
    }
    async activate(id, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(id, user);
        if (membershipCard.status !== 'inactive') {
            throw new common_1.BadRequestException('只有未激活的会员卡才能激活');
        }
        membershipCard.activate();
        return await this.membershipCardRepository.save(membershipCard);
    }
    async suspend(id, reason, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(id, user);
        if (membershipCard.status === 'frozen') {
            throw new common_1.BadRequestException('会员卡已经冻结');
        }
        if (membershipCard.status !== 'active') {
            throw new common_1.BadRequestException('只有激活的会员卡才能暂停');
        }
        membershipCard.freeze();
        membershipCard.notes = reason
            ? `冻结原因: ${reason}`
            : membershipCard.notes;
        return await this.membershipCardRepository.save(membershipCard);
    }
    async renew(id, renewalPeriod, amount, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(id, user);
        const currentExpiry = membershipCard.expiryDate || new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + renewalPeriod);
        membershipCard.expiryDate = newExpiry;
        membershipCard.status = 'active';
        membershipCard.updatedBy = user.id;
        return await this.membershipCardRepository.save(membershipCard);
    }
    async remove(id, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'delete');
        const membershipCard = await this.findOne(id, user);
        return await this.membershipCardRepository.remove(membershipCard);
    }
    async getStats(user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const queryBuilder = this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .where('membershipCard.brandId = :brandId', { brandId: user.brandId });
        if (user.storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        const [total, active, expired, suspended] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder
                .clone()
                .andWhere('membershipCard.status = :status', { status: 'active' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('membershipCard.status = :status', { status: 'expired' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('membershipCard.status = :status', { status: 'suspended' })
                .getCount(),
        ]);
        return {
            total,
            active,
            expired,
            suspended,
        };
    }
};
exports.MembershipCardsService = MembershipCardsService;
exports.MembershipCardsService = MembershipCardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(membership_card_entity_1.MembershipCard)),
    __param(1, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MembershipCardsService);
//# sourceMappingURL=membership-cards.service.js.map
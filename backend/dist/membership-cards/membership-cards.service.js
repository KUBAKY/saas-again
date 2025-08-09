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
    async validateBenefit(cardId, benefitType, user) {
        const membershipCard = await this.findOne(cardId, user);
        if (membershipCard.status !== 'active') {
            return { valid: false, message: '会员卡未激活或已过期' };
        }
        if (membershipCard.expiryDate && membershipCard.expiryDate < new Date()) {
            return { valid: false, message: '会员卡已过期' };
        }
        const benefits = membershipCard.benefits || {};
        const benefit = benefits[benefitType];
        if (!benefit) {
            return { valid: false, message: '该会员卡不包含此权益' };
        }
        if (benefit.usageLimit && benefit.usedCount >= benefit.usageLimit) {
            return { valid: false, message: '权益使用次数已达上限' };
        }
        return {
            valid: true,
            discount: benefit.discount,
        };
    }
    async useBenefit(cardId, benefitType, user) {
        const validation = await this.validateBenefit(cardId, benefitType, user);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.message);
        }
        const membershipCard = await this.findOne(cardId, user);
        const benefits = membershipCard.benefits || {
            discountRate: 0,
            freeServices: [],
            priorityBooking: false,
            guestPasses: 0,
            personalTrainingDiscount: 0,
            groupClassDiscount: 0,
            additionalBenefits: {},
        };
        if (benefits[benefitType]) {
            benefits[benefitType].usedCount =
                (benefits[benefitType].usedCount || 0) + 1;
            membershipCard.benefits = benefits;
            membershipCard.updatedBy = user.id;
        }
        return await this.membershipCardRepository.save(membershipCard);
    }
    async getUsageHistory(cardId, user) {
        const membershipCard = await this.findOne(cardId, user);
        const benefits = membershipCard.benefits || {};
        return Object.entries(benefits).map(([benefitType, benefit]) => ({
            benefitType,
            usedCount: benefit?.usedCount || 0,
            usageLimit: benefit?.usageLimit,
        }));
    }
    async getExpiringCards(days = 30, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        const queryBuilder = this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .leftJoinAndSelect('membershipCard.member', 'member')
            .where('membershipCard.brandId = :brandId', { brandId: user.brandId })
            .andWhere('membershipCard.status = :status', { status: 'active' })
            .andWhere('membershipCard.expiryDate <= :expiryDate', { expiryDate })
            .andWhere('membershipCard.expiryDate > :now', { now: new Date() });
        if (user.storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        return await queryBuilder
            .orderBy('membershipCard.expiryDate', 'ASC')
            .getMany();
    }
    async batchRenew(cardIds, renewalPeriod, amount, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const cardId of cardIds) {
            try {
                await this.renew(cardId, renewalPeriod, amount, user);
                success++;
            }
            catch (error) {
                failed++;
                errors.push(`卡片 ${cardId}: ${error.message}`);
            }
        }
        return { success, failed, errors };
    }
    async getCardTypeStats(user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const queryBuilder = this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .select('membershipCard.cardType', 'cardType')
            .addSelect('COUNT(*)', 'count')
            .where('membershipCard.brandId = :brandId', { brandId: user.brandId })
            .groupBy('membershipCard.cardType');
        if (user.storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        const results = await queryBuilder.getRawMany();
        return results.map((result) => ({
            cardType: result.cardType,
            count: parseInt(result.count),
        }));
    }
    async transferCard(cardId, newMemberId, reason, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(cardId, user);
        const newMember = await this.memberRepository.findOne({
            where: { id: newMemberId },
        });
        if (!newMember) {
            throw new common_1.NotFoundException('目标会员不存在');
        }
        if (membershipCard.status !== 'active') {
            throw new common_1.BadRequestException('只能转移激活状态的会员卡');
        }
        const transferNote = `转移给会员: ${newMember.name} (${newMember.phone}), 原因: ${reason}`;
        membershipCard.memberId = newMemberId;
        membershipCard.member = newMember;
        membershipCard.notes = `${membershipCard.notes || ''}\n${transferNote}`;
        membershipCard.updatedBy = user.id;
        membershipCard.updatedAt = new Date();
        return await this.membershipCardRepository.save(membershipCard);
    }
    async freezeCard(cardId, freezeDays, reason, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(cardId, user);
        if (membershipCard.status !== 'active') {
            throw new common_1.BadRequestException('只能冻结激活状态的会员卡');
        }
        if (membershipCard.expiryDate) {
            const newExpiryDate = new Date(membershipCard.expiryDate);
            newExpiryDate.setDate(newExpiryDate.getDate() + freezeDays);
            membershipCard.expiryDate = newExpiryDate;
        }
        membershipCard.status = 'frozen';
        membershipCard.notes = `${membershipCard.notes || ''}\n冻结 ${freezeDays} 天，原因: ${reason}`;
        membershipCard.updatedBy = user.id;
        membershipCard.updatedAt = new Date();
        return await this.membershipCardRepository.save(membershipCard);
    }
    async unfreezeCard(cardId, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(cardId, user);
        if (membershipCard.status !== 'frozen') {
            throw new common_1.BadRequestException('只能解冻冻结状态的会员卡');
        }
        membershipCard.status = 'active';
        membershipCard.notes = `${membershipCard.notes || ''}\n解冻操作`;
        membershipCard.updatedBy = user.id;
        membershipCard.updatedAt = new Date();
        return await this.membershipCardRepository.save(membershipCard);
    }
    async upgradeBenefits(cardId, newBenefits, additionalFee, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'update');
        const membershipCard = await this.findOne(cardId, user);
        if (membershipCard.status !== 'active') {
            throw new common_1.BadRequestException('只能升级激活状态的会员卡');
        }
        const currentBenefits = membershipCard.benefits || {
            discountRate: 0,
            freeServices: [],
            priorityBooking: false,
            guestPasses: 0,
            personalTrainingDiscount: 0,
            groupClassDiscount: 0,
            additionalBenefits: {},
        };
        membershipCard.benefits = {
            ...currentBenefits,
            ...(newBenefits || {}),
            additionalBenefits: {
                ...currentBenefits.additionalBenefits,
                ...(newBenefits?.additionalBenefits || {}),
            },
        };
        membershipCard.price = Number(membershipCard.price) + additionalFee;
        membershipCard.notes = `${membershipCard.notes || ''}\n权益升级，补缴费用: ${additionalFee}元`;
        membershipCard.updatedBy = user.id;
        membershipCard.updatedAt = new Date();
        return await this.membershipCardRepository.save(membershipCard);
    }
    async getUsageAnalytics(cardId, startDate, endDate, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const membershipCard = await this.findOne(cardId, user);
        const benefits = membershipCard.benefits || {};
        const benefitUsage = {};
        const remainingBenefits = {};
        let totalUsage = 0;
        Object.entries(benefits).forEach(([benefitType, benefit]) => {
            if (typeof benefit === 'object' && benefit !== null) {
                const usedCount = benefit.usedCount || 0;
                const usageLimit = benefit.usageLimit;
                benefitUsage[benefitType] = usedCount;
                totalUsage += usedCount;
                if (usageLimit) {
                    remainingBenefits[benefitType] = Math.max(0, usageLimit - usedCount);
                }
            }
        });
        const usageByDate = [];
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < daysDiff; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            usageByDate.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 3),
            });
        }
        return {
            totalUsage,
            benefitUsage,
            usageByDate,
            remainingBenefits,
        };
    }
    async batchImport(cardData, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'create');
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const data of cardData) {
            try {
                const existing = await this.membershipCardRepository.findOne({
                    where: { cardNumber: data.cardNumber },
                });
                if (existing) {
                    throw new Error(`卡号 ${data.cardNumber} 已存在`);
                }
                const member = await this.memberRepository.findOne({
                    where: { id: data.memberId },
                });
                if (!member) {
                    throw new Error(`会员ID ${data.memberId} 不存在`);
                }
                const issueDate = new Date();
                const expiryDate = data.validityDays
                    ? new Date(issueDate.getTime() + data.validityDays * 24 * 60 * 60 * 1000)
                    : undefined;
                const membershipCard = this.membershipCardRepository.create({
                    cardNumber: data.cardNumber,
                    type: data.type,
                    billingType: data.billingType,
                    price: data.price,
                    totalSessions: data.totalSessions,
                    validityDays: data.validityDays,
                    issueDate,
                    expiryDate,
                    memberId: data.memberId,
                    member,
                    status: 'inactive',
                    createdBy: user.id,
                });
                await this.membershipCardRepository.save(membershipCard);
                success++;
            }
            catch (error) {
                failed++;
                errors.push(`卡号 ${data.cardNumber}: ${error.message}`);
            }
        }
        return { success, failed, errors };
    }
    async getRevenueStats(startDate, endDate, user) {
        (0, permission_util_1.checkPermission)(user.roles?.[0]?.name || '', 'membership-card', 'read');
        const queryBuilder = this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .where('membershipCard.brandId = :brandId', { brandId: user.brandId })
            .andWhere('membershipCard.issueDate BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        if (user.storeId) {
            queryBuilder.andWhere('membershipCard.storeId = :storeId', {
                storeId: user.storeId,
            });
        }
        const cards = await queryBuilder.getMany();
        const totalRevenue = cards.reduce((sum, card) => sum + Number(card.price), 0);
        const cardTypeStats = new Map();
        cards.forEach((card) => {
            const existing = cardTypeStats.get(card.type) || { revenue: 0, count: 0 };
            existing.revenue += Number(card.price);
            existing.count += 1;
            cardTypeStats.set(card.type, existing);
        });
        const cardTypeRevenue = Array.from(cardTypeStats.entries()).map(([type, stats]) => ({
            type,
            revenue: stats.revenue,
            count: stats.count,
        }));
        const monthlyStats = new Map();
        cards.forEach((card) => {
            const month = card.issueDate.toISOString().substring(0, 7);
            const existing = monthlyStats.get(month) || 0;
            monthlyStats.set(month, existing + Number(card.price));
        });
        const monthlyRevenue = Array.from(monthlyStats.entries())
            .map(([month, revenue]) => ({ month, revenue }))
            .sort((a, b) => a.month.localeCompare(b.month));
        const renewalRevenue = cards
            .filter((card) => card.notes?.includes('续费'))
            .reduce((sum, card) => sum + Number(card.price), 0);
        return {
            totalRevenue,
            cardTypeRevenue,
            monthlyRevenue,
            renewalRevenue,
        };
    }
    async processExpiredCards() {
        const now = new Date();
        const expiredCards = await this.membershipCardRepository
            .createQueryBuilder('membershipCard')
            .where('membershipCard.status = :status', { status: 'active' })
            .andWhere('membershipCard.expiryDate < :now', { now })
            .getMany();
        let processed = 0;
        const errors = [];
        for (const card of expiredCards) {
            try {
                card.status = 'expired';
                card.notes = `${card.notes || ''}\n系统自动标记为过期`;
                card.updatedAt = now;
                await this.membershipCardRepository.save(card);
                processed++;
            }
            catch (error) {
                errors.push(`处理卡片 ${card.cardNumber} 失败: ${error.message}`);
            }
        }
        return { processed, errors };
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
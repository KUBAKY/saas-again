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
exports.GroupClassCardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_class_card_entity_1 = require("../entities/group-class-card.entity");
const member_entity_1 = require("../entities/member.entity");
const membership_card_entity_1 = require("../entities/membership-card.entity");
let GroupClassCardsService = class GroupClassCardsService {
    groupClassCardRepository;
    memberRepository;
    membershipCardRepository;
    constructor(groupClassCardRepository, memberRepository, membershipCardRepository) {
        this.groupClassCardRepository = groupClassCardRepository;
        this.memberRepository = memberRepository;
        this.membershipCardRepository = membershipCardRepository;
    }
    async create(createDto, user) {
        const member = await this.memberRepository.findOne({
            where: { id: createDto.memberId },
            relations: ['store'],
        });
        if (!member || member.store?.id !== user.storeId) {
            throw new common_1.NotFoundException('会员不存在');
        }
        const membershipCard = await this.membershipCardRepository.findOne({
            where: {
                id: createDto.membershipCardId,
                memberId: createDto.memberId,
            },
            relations: ['member', 'member.store'],
        });
        if (!membershipCard || membershipCard.member?.store?.id !== user.storeId) {
            throw new common_1.NotFoundException('会籍卡不存在');
        }
        if (!membershipCard.isActive()) {
            throw new common_1.BadRequestException('会籍卡未激活或已过期，无法购买团课卡');
        }
        const cardNumber = await this.generateCardNumber();
        const groupClassCard = this.groupClassCardRepository.create({
            ...createDto,
            cardNumber,
            purchaseDate: createDto.purchaseDate ? new Date(createDto.purchaseDate) : new Date(),
            usedSessions: 0,
            status: 'inactive',
        });
        return await this.groupClassCardRepository.save(groupClassCard);
    }
    async findAll(queryDto, user) {
        const { page = 1, limit = 20, memberId, membershipCardId, type, status, purchaseDateStart, purchaseDateEnd, search, } = queryDto;
        const where = {};
        if (memberId)
            where.memberId = memberId;
        if (membershipCardId)
            where.membershipCardId = membershipCardId;
        if (type)
            where.type = (0, typeorm_2.Like)(`%${type}%`);
        if (status)
            where.status = status;
        if (purchaseDateStart && purchaseDateEnd) {
            where.purchaseDate = (0, typeorm_2.Between)(new Date(purchaseDateStart), new Date(purchaseDateEnd));
        }
        else if (purchaseDateStart) {
            where.purchaseDate = (0, typeorm_2.MoreThanOrEqual)(new Date(purchaseDateStart));
        }
        else if (purchaseDateEnd) {
            where.purchaseDate = (0, typeorm_2.LessThanOrEqual)(new Date(purchaseDateEnd));
        }
        const options = {
            where,
            relations: ['member', 'membershipCard', 'member.store'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        };
        if (search) {
            options.where = [
                { ...where, cardNumber: (0, typeorm_2.Like)(`%${search}%`) },
                { ...where, type: (0, typeorm_2.Like)(`%${search}%`) },
            ];
        }
        const [allCards, allTotal] = await this.groupClassCardRepository.findAndCount({
            where: options.where,
            relations: ['member', 'member.store', 'membershipCard'],
            order: { createdAt: 'DESC' },
        });
        const filteredCards = allCards.filter(card => card.member.store.id === user.storeId);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedCards = filteredCards.slice(startIndex, endIndex);
        const filteredTotal = filteredCards.length;
        return {
            data: paginatedCards,
            total: filteredTotal,
            page,
            limit,
            totalPages: Math.ceil(filteredTotal / limit),
        };
    }
    async findOne(id, user) {
        const card = await this.groupClassCardRepository.findOne({
            where: { id },
            relations: ['member', 'membershipCard', 'member.store'],
        });
        if (!card || card.member?.store?.id !== user.storeId) {
            throw new common_1.NotFoundException('团课卡不存在');
        }
        return card;
    }
    async update(id, updateDto, user) {
        const card = await this.findOne(id, user);
        if (updateDto.memberId && updateDto.memberId !== card.memberId) {
            const member = await this.memberRepository.findOne({
                where: { id: updateDto.memberId },
                relations: ['store'],
            });
            if (!member || member.store?.id !== user.storeId) {
                throw new common_1.NotFoundException('会员不存在');
            }
        }
        if (updateDto.membershipCardId && updateDto.membershipCardId !== card.membershipCardId) {
            const membershipCard = await this.membershipCardRepository.findOne({
                where: {
                    id: updateDto.membershipCardId,
                    memberId: updateDto.memberId || card.memberId,
                },
                relations: ['member', 'member.store'],
            });
            if (!membershipCard || membershipCard.member?.store?.id !== user.storeId) {
                throw new common_1.NotFoundException('会籍卡不存在');
            }
        }
        Object.assign(card, updateDto);
        return await this.groupClassCardRepository.save(card);
    }
    async remove(id, user) {
        const card = await this.findOne(id, user);
        if (card.status === 'active' && card.usedSessions > 0) {
            throw new common_1.BadRequestException('已使用的团课卡不能删除，请先退款');
        }
        await this.groupClassCardRepository.softDelete(id);
    }
    async activate(id, user) {
        const card = await this.findOne(id, user);
        if (card.status !== 'inactive') {
            throw new common_1.BadRequestException('只有未激活的团课卡才能激活');
        }
        const membershipCard = await this.membershipCardRepository.findOne({
            where: { id: card.membershipCardId },
        });
        if (!membershipCard || !membershipCard.isActive()) {
            throw new common_1.BadRequestException('会籍卡已过期，无法激活团课卡');
        }
        card.activate();
        return await this.groupClassCardRepository.save(card);
    }
    async freeze(id, user) {
        const card = await this.findOne(id, user);
        card.freeze();
        return await this.groupClassCardRepository.save(card);
    }
    async unfreeze(id, user) {
        const card = await this.findOne(id, user);
        card.unfreeze();
        return await this.groupClassCardRepository.save(card);
    }
    async useSession(id, user) {
        const card = await this.findOne(id, user);
        if (!card.use()) {
            throw new common_1.BadRequestException('团课卡无法使用');
        }
        return await this.groupClassCardRepository.save(card);
    }
    async expire(id, user) {
        const card = await this.findOne(id, user);
        card.status = 'expired';
        return await this.groupClassCardRepository.save(card);
    }
    async generateCardNumber() {
        const prefix = 'GCC';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
};
exports.GroupClassCardsService = GroupClassCardsService;
exports.GroupClassCardsService = GroupClassCardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_class_card_entity_1.GroupClassCard)),
    __param(1, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __param(2, (0, typeorm_1.InjectRepository)(membership_card_entity_1.MembershipCard)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GroupClassCardsService);
//# sourceMappingURL=group-class-cards.service.js.map
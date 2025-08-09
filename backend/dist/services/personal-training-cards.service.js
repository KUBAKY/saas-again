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
exports.PersonalTrainingCardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const personal_training_card_entity_1 = require("../entities/personal-training-card.entity");
const member_entity_1 = require("../entities/member.entity");
const membership_card_entity_1 = require("../entities/membership-card.entity");
const coach_entity_1 = require("../entities/coach.entity");
let PersonalTrainingCardsService = class PersonalTrainingCardsService {
    personalTrainingCardRepository;
    memberRepository;
    membershipCardRepository;
    coachRepository;
    constructor(personalTrainingCardRepository, memberRepository, membershipCardRepository, coachRepository) {
        this.personalTrainingCardRepository = personalTrainingCardRepository;
        this.memberRepository = memberRepository;
        this.membershipCardRepository = membershipCardRepository;
        this.coachRepository = coachRepository;
    }
    async create(createDto, user) {
        const member = await this.memberRepository.findOne({
            where: { id: createDto.memberId },
            relations: ['store'],
        });
        if (!member) {
            throw new common_1.NotFoundException('会员不存在');
        }
        if (member.store.id !== user.storeId) {
            throw new common_1.BadRequestException('无权限操作此会员');
        }
        const membershipCard = await this.membershipCardRepository.findOne({
            where: { id: createDto.membershipCardId },
            relations: ['member', 'member.store'],
        });
        if (!membershipCard) {
            throw new common_1.NotFoundException('会籍卡不存在');
        }
        if (membershipCard.member.id !== createDto.memberId) {
            throw new common_1.BadRequestException('会籍卡不属于该会员');
        }
        if (membershipCard.member.store.id !== user.storeId) {
            throw new common_1.BadRequestException('无权限操作此会籍卡');
        }
        const coach = await this.coachRepository.findOne({
            where: { id: createDto.coachId },
            relations: ['store'],
        });
        if (!coach) {
            throw new common_1.NotFoundException('教练不存在');
        }
        if (coach.store.id !== user.storeId) {
            throw new common_1.BadRequestException('无权限操作此教练');
        }
        const cardNumber = await this.generateCardNumber();
        const personalTrainingCard = this.personalTrainingCardRepository.create({
            ...createDto,
            cardNumber,
            member,
            membershipCard,
            coach,
            usedSessions: 0,
            status: 'inactive',
        });
        return await this.personalTrainingCardRepository.save(personalTrainingCard);
    }
    async findAll(query, user) {
        const { page = 1, limit = 10, ...filters } = query;
        const skip = (page - 1) * limit;
        const queryBuilder = this.personalTrainingCardRepository
            .createQueryBuilder('card')
            .leftJoinAndSelect('card.member', 'member')
            .leftJoinAndSelect('card.membershipCard', 'membershipCard')
            .leftJoinAndSelect('card.coach', 'coach')
            .leftJoinAndSelect('member.store', 'store')
            .where('store.id = :storeId', { storeId: user.storeId });
        if (filters.memberId) {
            queryBuilder.andWhere('member.id = :memberId', {
                memberId: filters.memberId,
            });
        }
        if (filters.membershipCardId) {
            queryBuilder.andWhere('membershipCard.id = :membershipCardId', {
                membershipCardId: filters.membershipCardId,
            });
        }
        if (filters.coachId) {
            queryBuilder.andWhere('coach.id = :coachId', {
                coachId: filters.coachId,
            });
        }
        if (filters.type) {
            queryBuilder.andWhere('card.type = :type', { type: filters.type });
        }
        if (filters.status) {
            queryBuilder.andWhere('card.status = :status', {
                status: filters.status,
            });
        }
        if (filters.purchaseDateStart) {
            queryBuilder.andWhere('card.purchaseDate >= :purchaseDateStart', {
                purchaseDateStart: filters.purchaseDateStart,
            });
        }
        if (filters.purchaseDateEnd) {
            queryBuilder.andWhere('card.purchaseDate <= :purchaseDateEnd', {
                purchaseDateEnd: filters.purchaseDateEnd,
            });
        }
        if (filters.search) {
            queryBuilder.andWhere('(card.cardNumber LIKE :search OR member.name LIKE :search OR coach.name LIKE :search)', { search: `%${filters.search}%` });
        }
        const total = await queryBuilder.getCount();
        const items = await queryBuilder
            .skip(skip)
            .take(limit)
            .orderBy('card.createdAt', 'DESC')
            .getMany();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, user) {
        const card = await this.personalTrainingCardRepository.findOne({
            where: { id },
            relations: ['member', 'member.store', 'membershipCard', 'coach'],
        });
        if (!card) {
            throw new common_1.NotFoundException('私教卡不存在');
        }
        if (card.member.store.id !== user.storeId) {
            throw new common_1.BadRequestException('无权限访问此私教卡');
        }
        return card;
    }
    async update(id, updateDto, user) {
        const card = await this.findOne(id, user);
        if (updateDto.memberId && updateDto.memberId !== card.member.id) {
            const member = await this.memberRepository.findOne({
                where: { id: updateDto.memberId },
                relations: ['store'],
            });
            if (!member) {
                throw new common_1.NotFoundException('会员不存在');
            }
            if (member.store.id !== user.storeId) {
                throw new common_1.BadRequestException('无权限操作此会员');
            }
            card.member = member;
        }
        if (updateDto.membershipCardId &&
            updateDto.membershipCardId !== card.membershipCard.id) {
            const membershipCard = await this.membershipCardRepository.findOne({
                where: { id: updateDto.membershipCardId },
                relations: ['member', 'member.store'],
            });
            if (!membershipCard) {
                throw new common_1.NotFoundException('会籍卡不存在');
            }
            const targetMemberId = updateDto.memberId || card.member.id;
            if (membershipCard.member.id !== targetMemberId) {
                throw new common_1.BadRequestException('会籍卡不属于该会员');
            }
            if (membershipCard.member.store.id !== user.storeId) {
                throw new common_1.BadRequestException('无权限操作此会籍卡');
            }
            card.membershipCard = membershipCard;
        }
        if (updateDto.coachId && updateDto.coachId !== card.coach?.id) {
            const coach = await this.coachRepository.findOne({
                where: { id: updateDto.coachId },
                relations: ['store'],
            });
            if (!coach) {
                throw new common_1.NotFoundException('教练不存在');
            }
            if (coach.store.id !== user.storeId) {
                throw new common_1.BadRequestException('无权限操作此教练');
            }
            card.coach = coach;
        }
        Object.assign(card, updateDto);
        return await this.personalTrainingCardRepository.save(card);
    }
    async remove(id, user) {
        const card = await this.findOne(id, user);
        await this.personalTrainingCardRepository.remove(card);
    }
    async activate(id, user) {
        const card = await this.findOne(id, user);
        card.activate();
        return await this.personalTrainingCardRepository.save(card);
    }
    async freeze(id, user) {
        const card = await this.findOne(id, user);
        card.freeze();
        return await this.personalTrainingCardRepository.save(card);
    }
    async unfreeze(id, user) {
        const card = await this.findOne(id, user);
        card.unfreeze();
        return await this.personalTrainingCardRepository.save(card);
    }
    async useSession(id, user) {
        const card = await this.findOne(id, user);
        if (!card.use()) {
            throw new common_1.BadRequestException('私教卡无法使用');
        }
        return await this.personalTrainingCardRepository.save(card);
    }
    async expire(id, user) {
        const card = await this.findOne(id, user);
        card.status = 'expired';
        return await this.personalTrainingCardRepository.save(card);
    }
    async generateCardNumber() {
        const prefix = 'PT';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    }
};
exports.PersonalTrainingCardsService = PersonalTrainingCardsService;
exports.PersonalTrainingCardsService = PersonalTrainingCardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(personal_training_card_entity_1.PersonalTrainingCard)),
    __param(1, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __param(2, (0, typeorm_1.InjectRepository)(membership_card_entity_1.MembershipCard)),
    __param(3, (0, typeorm_1.InjectRepository)(coach_entity_1.Coach)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PersonalTrainingCardsService);
//# sourceMappingURL=personal-training-cards.service.js.map
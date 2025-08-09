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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalTrainingCard = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const membership_card_entity_1 = require("./membership-card.entity");
const coach_entity_1 = require("./coach.entity");
let PersonalTrainingCard = class PersonalTrainingCard extends base_entity_1.BaseEntity {
    cardNumber;
    type;
    price;
    totalSessions;
    usedSessions;
    purchaseDate;
    activationDate;
    status;
    notes;
    settings;
    memberId;
    membershipCardId;
    coachId;
    member;
    membershipCard;
    coach;
    isActive() {
        return this.status === 'active' && !this.deletedAt && !this.isExpired();
    }
    isExpired() {
        return false;
    }
    getRemainingTimes() {
        return Math.max(0, this.totalSessions - this.usedSessions);
    }
    canUse() {
        if (!this.isActive())
            return false;
        return this.getRemainingTimes() > 0;
    }
    use() {
        if (!this.canUse())
            return false;
        this.usedSessions += 1;
        if (this.getRemainingTimes() === 0) {
            this.status = 'expired';
        }
        return true;
    }
    activate() {
        if (this.status !== 'inactive')
            return;
        this.status = 'active';
        this.activationDate = new Date();
    }
    freeze() {
        if (this.status === 'active') {
            this.status = 'frozen';
        }
    }
    unfreeze() {
        if (this.status === 'frozen') {
            this.status = 'active';
        }
    }
    assignCoach(coachId) {
        this.coachId = coachId;
    }
    removeCoach() {
        this.coachId = undefined;
    }
};
exports.PersonalTrainingCard = PersonalTrainingCard;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        unique: true,
        nullable: false,
        comment: '私教卡号',
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "cardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '私教卡类型名称',
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '私教卡价格',
    }),
    __metadata("design:type", Number)
], PersonalTrainingCard.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: false,
        comment: '总课时数',
    }),
    __metadata("design:type", Number)
], PersonalTrainingCard.prototype, "totalSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '已使用课时数',
    }),
    __metadata("design:type", Number)
], PersonalTrainingCard.prototype, "usedSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        comment: '购买日期',
    }),
    __metadata("design:type", Date)
], PersonalTrainingCard.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '激活日期',
    }),
    __metadata("design:type", Date)
], PersonalTrainingCard.prototype, "activationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'expired', 'frozen'],
        default: 'inactive',
        comment: '私教卡状态',
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '私教卡配置',
    }),
    __metadata("design:type", Object)
], PersonalTrainingCard.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'membership_card_id',
        type: 'uuid',
        nullable: false,
        comment: '关联的会籍卡ID',
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "membershipCardId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'coach_id',
        type: 'uuid',
        nullable: true,
        comment: '指定教练ID',
    }),
    __metadata("design:type", String)
], PersonalTrainingCard.prototype, "coachId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (member) => member.personalTrainingCards, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], PersonalTrainingCard.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => membership_card_entity_1.MembershipCard, (membershipCard) => membershipCard.personalTrainingCards, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'membership_card_id' }),
    __metadata("design:type", membership_card_entity_1.MembershipCard)
], PersonalTrainingCard.prototype, "membershipCard", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coach_entity_1.Coach, (coach) => coach.personalTrainingCards, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", coach_entity_1.Coach)
], PersonalTrainingCard.prototype, "coach", void 0);
exports.PersonalTrainingCard = PersonalTrainingCard = __decorate([
    (0, typeorm_1.Entity)('personal_training_cards'),
    (0, typeorm_1.Index)(['cardNumber'], { unique: true })
], PersonalTrainingCard);
//# sourceMappingURL=personal-training-card.entity.js.map
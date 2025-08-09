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
exports.MembershipCard = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const group_class_card_entity_1 = require("./group-class-card.entity");
const personal_training_card_entity_1 = require("./personal-training-card.entity");
let MembershipCard = class MembershipCard extends base_entity_1.BaseEntity {
    cardNumber;
    type;
    billingType;
    price;
    totalSessions;
    usedSessions;
    validityDays;
    issueDate;
    expiryDate;
    activationDate;
    status;
    notes;
    settings;
    memberId;
    member;
    groupClassCards;
    personalTrainingCards;
    isActive() {
        return this.status === 'active' && !this.deletedAt && !this.isExpired();
    }
    isExpired() {
        if (!this.expiryDate)
            return false;
        return new Date() > new Date(this.expiryDate);
    }
    getRemainingDays() {
        if (!this.expiryDate)
            return null;
        const today = new Date();
        const expiry = new Date(this.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }
    getRemainingTimes() {
        if (this.billingType !== 'times' || !this.totalSessions)
            return null;
        return Math.max(0, this.totalSessions - this.usedSessions);
    }
    canUse() {
        if (!this.isActive())
            return false;
        if (this.billingType === 'times') {
            return (this.getRemainingTimes() || 0) > 0;
        }
        return true;
    }
    use() {
        if (!this.canUse())
            return false;
        if (this.billingType === 'times') {
            this.usedSessions += 1;
            if (this.getRemainingTimes() === 0) {
                this.status = 'expired';
            }
        }
        return true;
    }
    activate() {
        if (this.status !== 'inactive')
            return;
        this.status = 'active';
        this.activationDate = new Date();
        if (this.validityDays && !this.expiryDate) {
            const expiryDate = new Date(this.activationDate);
            expiryDate.setDate(expiryDate.getDate() + this.validityDays);
            this.expiryDate = expiryDate;
        }
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
    refund() {
        this.status = 'refunded';
    }
    getUsagePercentage() {
        if (this.billingType !== 'times' || !this.totalSessions)
            return 0;
        return Math.round((this.usedSessions / this.totalSessions) * 100);
    }
};
exports.MembershipCard = MembershipCard;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        unique: true,
        nullable: false,
        comment: '卡号',
    }),
    __metadata("design:type", String)
], MembershipCard.prototype, "cardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '卡类型名称',
    }),
    __metadata("design:type", String)
], MembershipCard.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['times', 'period', 'unlimited'],
        nullable: false,
        comment: '计费方式',
    }),
    __metadata("design:type", String)
], MembershipCard.prototype, "billingType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '卡片价格',
    }),
    __metadata("design:type", Number)
], MembershipCard.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: true,
        comment: '总次数（次卡）',
    }),
    __metadata("design:type", Number)
], MembershipCard.prototype, "totalSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '已使用次数',
    }),
    __metadata("design:type", Number)
], MembershipCard.prototype, "usedSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: true,
        comment: '有效期（天数）',
    }),
    __metadata("design:type", Number)
], MembershipCard.prototype, "validityDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        comment: '开卡日期',
    }),
    __metadata("design:type", Date)
], MembershipCard.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '到期日期',
    }),
    __metadata("design:type", Date)
], MembershipCard.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '激活日期',
    }),
    __metadata("design:type", Date)
], MembershipCard.prototype, "activationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'expired', 'frozen', 'refunded'],
        default: 'inactive',
        comment: '卡状态',
    }),
    __metadata("design:type", String)
], MembershipCard.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], MembershipCard.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '卡片配置',
    }),
    __metadata("design:type", Object)
], MembershipCard.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], MembershipCard.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (member) => member.membershipCards, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], MembershipCard.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_class_card_entity_1.GroupClassCard, (card) => card.membershipCard),
    __metadata("design:type", Array)
], MembershipCard.prototype, "groupClassCards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => personal_training_card_entity_1.PersonalTrainingCard, (card) => card.membershipCard),
    __metadata("design:type", Array)
], MembershipCard.prototype, "personalTrainingCards", void 0);
exports.MembershipCard = MembershipCard = __decorate([
    (0, typeorm_1.Entity)('membership_cards'),
    (0, typeorm_1.Index)(['cardNumber'], { unique: true })
], MembershipCard);
//# sourceMappingURL=membership-card.entity.js.map
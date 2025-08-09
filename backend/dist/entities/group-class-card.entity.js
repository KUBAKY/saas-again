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
exports.GroupClassCard = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const membership_card_entity_1 = require("./membership-card.entity");
let GroupClassCard = class GroupClassCard extends base_entity_1.BaseEntity {
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
    member;
    membershipCard;
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
};
exports.GroupClassCard = GroupClassCard;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        unique: true,
        nullable: false,
        comment: '团课卡号',
    }),
    __metadata("design:type", String)
], GroupClassCard.prototype, "cardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '团课卡类型名称',
    }),
    __metadata("design:type", String)
], GroupClassCard.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '团课卡价格',
    }),
    __metadata("design:type", Number)
], GroupClassCard.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: false,
        comment: '总课时数',
    }),
    __metadata("design:type", Number)
], GroupClassCard.prototype, "totalSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '已使用课时数',
    }),
    __metadata("design:type", Number)
], GroupClassCard.prototype, "usedSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        comment: '购买日期',
    }),
    __metadata("design:type", Date)
], GroupClassCard.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '激活日期',
    }),
    __metadata("design:type", Date)
], GroupClassCard.prototype, "activationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'expired', 'frozen'],
        default: 'inactive',
        comment: '团课卡状态',
    }),
    __metadata("design:type", String)
], GroupClassCard.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], GroupClassCard.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '团课卡配置',
    }),
    __metadata("design:type", Object)
], GroupClassCard.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], GroupClassCard.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'membership_card_id',
        type: 'uuid',
        nullable: false,
        comment: '关联的会籍卡ID',
    }),
    __metadata("design:type", String)
], GroupClassCard.prototype, "membershipCardId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (member) => member.groupClassCards, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], GroupClassCard.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => membership_card_entity_1.MembershipCard, (membershipCard) => membershipCard.groupClassCards, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'membership_card_id' }),
    __metadata("design:type", membership_card_entity_1.MembershipCard)
], GroupClassCard.prototype, "membershipCard", void 0);
exports.GroupClassCard = GroupClassCard = __decorate([
    (0, typeorm_1.Entity)('group_class_cards'),
    (0, typeorm_1.Index)(['cardNumber'], { unique: true })
], GroupClassCard);
//# sourceMappingURL=group-class-card.entity.js.map
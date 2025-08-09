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
exports.Member = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const store_entity_1 = require("./store.entity");
const membership_card_entity_1 = require("./membership-card.entity");
const check_in_entity_1 = require("./check-in.entity");
const booking_entity_1 = require("./booking.entity");
const group_class_card_entity_1 = require("./group-class-card.entity");
const personal_training_card_entity_1 = require("./personal-training-card.entity");
const order_entity_1 = require("./order.entity");
let Member = class Member extends base_entity_1.BaseEntity {
    memberNumber;
    name;
    phone;
    email;
    gender;
    birthday;
    idCard;
    avatar;
    address;
    emergencyContact;
    emergencyPhone;
    height;
    weight;
    healthNote;
    fitnessGoal;
    bodyMetrics;
    wechatOpenId;
    wechatUnionId;
    level;
    points;
    lastCheckInAt;
    status;
    notes;
    preferences;
    storeId;
    store;
    membershipCards;
    checkIns;
    bookings;
    groupClassCards;
    personalTrainingCards;
    orders;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    getAge() {
        if (!this.birthday)
            return null;
        const today = new Date();
        const birthDate = new Date(this.birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    getBMI() {
        if (!this.height || !this.weight)
            return null;
        const heightInMeters = this.height / 100;
        return (Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100);
    }
    getActiveMembershipCards() {
        return this.membershipCards?.filter((card) => card.isActive()) || [];
    }
    hasActiveMembership() {
        return this.getActiveMembershipCards().length > 0;
    }
    getTotalCheckIns() {
        return this.checkIns?.length || 0;
    }
    getCheckInStreak() {
        if (!this.checkIns || this.checkIns.length === 0)
            return 0;
        const sortedCheckIns = this.checkIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        for (const checkIn of sortedCheckIns) {
            const checkInDate = new Date(checkIn.checkInTime);
            checkInDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0 || diffDays === 1) {
                streak++;
                currentDate = checkInDate;
            }
            else {
                break;
            }
        }
        return streak;
    }
    addBodyMetric(metric) {
        if (!this.bodyMetrics) {
            this.bodyMetrics = [];
        }
        this.bodyMetrics.push({
            date: new Date().toISOString().split('T')[0],
            ...metric,
        });
        this.weight = metric.weight;
    }
    getLatestBodyMetric() {
        if (!this.bodyMetrics || this.bodyMetrics.length === 0)
            return null;
        return this.bodyMetrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }
};
exports.Member = Member;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        unique: true,
        nullable: false,
        comment: '会员编号',
    }),
    __metadata("design:type", String)
], Member.prototype, "memberNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '会员姓名',
    }),
    __metadata("design:type", String)
], Member.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        unique: true,
        nullable: false,
        comment: '手机号码',
    }),
    __metadata("design:type", String)
], Member.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '邮箱地址',
    }),
    __metadata("design:type", String)
], Member.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['male', 'female', 'other'],
        nullable: true,
        comment: '性别',
    }),
    __metadata("design:type", String)
], Member.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '生日',
    }),
    __metadata("design:type", Date)
], Member.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 18,
        nullable: true,
        comment: '身份证号',
    }),
    __metadata("design:type", String)
], Member.prototype, "idCard", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '头像URL',
    }),
    __metadata("design:type", String)
], Member.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '地址',
    }),
    __metadata("design:type", String)
], Member.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '紧急联系人',
    }),
    __metadata("design:type", String)
], Member.prototype, "emergencyContact", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: true,
        comment: '紧急联系人电话',
    }),
    __metadata("design:type", String)
], Member.prototype, "emergencyPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: '身高（cm）',
    }),
    __metadata("design:type", Number)
], Member.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: '体重（kg）',
    }),
    __metadata("design:type", Number)
], Member.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '健康状况说明',
    }),
    __metadata("design:type", String)
], Member.prototype, "healthNote", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '健身目标',
    }),
    __metadata("design:type", String)
], Member.prototype, "fitnessGoal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '身体指标历史记录',
    }),
    __metadata("design:type", Array)
], Member.prototype, "bodyMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '微信OpenID',
    }),
    __metadata("design:type", String)
], Member.prototype, "wechatOpenId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '微信UnionID',
    }),
    __metadata("design:type", String)
], Member.prototype, "wechatUnionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        default: 'bronze',
        comment: '会员等级',
    }),
    __metadata("design:type", String)
], Member.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '积分',
    }),
    __metadata("design:type", Number)
], Member.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: '最后签到时间',
    }),
    __metadata("design:type", Date)
], Member.prototype, "lastCheckInAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'suspended', 'expired'],
        default: 'active',
        comment: '会员状态',
    }),
    __metadata("design:type", String)
], Member.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], Member.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '会员偏好设置',
    }),
    __metadata("design:type", Object)
], Member.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Member.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => store_entity_1.Store, (store) => store.members, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'store_id' }),
    __metadata("design:type", store_entity_1.Store)
], Member.prototype, "store", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => membership_card_entity_1.MembershipCard, (card) => card.member),
    __metadata("design:type", Array)
], Member.prototype, "membershipCards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => check_in_entity_1.CheckIn, (checkIn) => checkIn.member),
    __metadata("design:type", Array)
], Member.prototype, "checkIns", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.member),
    __metadata("design:type", Array)
], Member.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_class_card_entity_1.GroupClassCard, (card) => card.member),
    __metadata("design:type", Array)
], Member.prototype, "groupClassCards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => personal_training_card_entity_1.PersonalTrainingCard, (card) => card.member),
    __metadata("design:type", Array)
], Member.prototype, "personalTrainingCards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.member),
    __metadata("design:type", Array)
], Member.prototype, "orders", void 0);
exports.Member = Member = __decorate([
    (0, typeorm_1.Entity)('members'),
    (0, typeorm_1.Index)(['phone'], { unique: true }),
    (0, typeorm_1.Index)(['memberNumber'], { unique: true })
], Member);
//# sourceMappingURL=member.entity.js.map
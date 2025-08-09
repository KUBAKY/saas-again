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
exports.Course = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const store_entity_1 = require("./store.entity");
const coach_entity_1 = require("./coach.entity");
const booking_entity_1 = require("./booking.entity");
let Course = class Course extends base_entity_1.BaseEntity {
    name;
    description;
    type;
    level;
    duration;
    maxParticipants;
    price;
    coverImage;
    tags;
    equipment;
    requirements;
    caloriesBurn;
    rating;
    reviewCount;
    totalParticipants;
    status;
    settings;
    storeId;
    coachId;
    store;
    coach;
    bookings;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    isPersonalTraining() {
        return this.type === 'personal';
    }
    isGroupClass() {
        return this.type === 'group';
    }
    canAccommodate(participants) {
        return participants <= this.maxParticipants;
    }
    getDurationHours() {
        return Math.round((this.duration / 60) * 100) / 100;
    }
    updateRating(newRating) {
        const totalScore = this.rating * this.reviewCount + newRating;
        this.reviewCount += 1;
        this.rating = Math.round((totalScore / this.reviewCount) * 100) / 100;
    }
    incrementParticipants() {
        this.totalParticipants += 1;
    }
    hasTag(tag) {
        return this.tags?.includes(tag) || false;
    }
    requiresEquipment(equipment) {
        return this.equipment?.includes(equipment) || false;
    }
    isPopular() {
        return this.totalParticipants > 100 && this.rating >= 4.5;
    }
    getBookingCount() {
        return this.bookings?.length || 0;
    }
    getActiveBookings() {
        return this.bookings?.filter(booking => booking.status === 'confirmed' &&
            new Date(booking.startTime) > new Date()) || [];
    }
    getCurrentBookings() {
        const now = new Date();
        return this.bookings?.filter(booking => booking.status === 'confirmed' &&
            new Date(booking.startTime) <= now &&
            new Date(booking.endTime) >= now) || [];
    }
};
exports.Course = Course;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '课程名称',
    }),
    __metadata("design:type", String)
], Course.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '课程描述',
    }),
    __metadata("design:type", String)
], Course.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['personal', 'group', 'workshop'],
        nullable: false,
        comment: '课程类型',
    }),
    __metadata("design:type", String)
], Course.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['beginner', 'intermediate', 'advanced', 'all'],
        default: 'all',
        comment: '适合级别',
    }),
    __metadata("design:type", String)
], Course.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: false,
        comment: '课程时长（分钟）',
    }),
    __metadata("design:type", Number)
], Course.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: false,
        comment: '最大参与人数',
    }),
    __metadata("design:type", Number)
], Course.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '课程价格',
    }),
    __metadata("design:type", Number)
], Course.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '课程封面图URL',
    }),
    __metadata("design:type", String)
], Course.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '课程标签',
    }),
    __metadata("design:type", Array)
], Course.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '所需器材',
    }),
    __metadata("design:type", Array)
], Course.prototype, "equipment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '注意事项',
    }),
    __metadata("design:type", String)
], Course.prototype, "requirements", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '消耗卡路里（估算）',
    }),
    __metadata("design:type", Number)
], Course.prototype, "caloriesBurn", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 5.0,
        comment: '平均评分',
    }),
    __metadata("design:type", Number)
], Course.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '评价总数',
    }),
    __metadata("design:type", Number)
], Course.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '总参与次数',
    }),
    __metadata("design:type", Number)
], Course.prototype, "totalParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
        comment: '课程状态',
    }),
    __metadata("design:type", String)
], Course.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '课程设置',
    }),
    __metadata("design:type", Object)
], Course.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Course.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'coach_id',
        type: 'uuid',
        nullable: true,
        comment: '主要教练ID',
    }),
    __metadata("design:type", String)
], Course.prototype, "coachId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => store_entity_1.Store, (store) => store.courses, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'store_id' }),
    __metadata("design:type", store_entity_1.Store)
], Course.prototype, "store", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coach_entity_1.Coach, (coach) => coach.courses, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", coach_entity_1.Coach)
], Course.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.course),
    __metadata("design:type", Array)
], Course.prototype, "bookings", void 0);
exports.Course = Course = __decorate([
    (0, typeorm_1.Entity)('courses'),
    (0, typeorm_1.Index)(['storeId', 'name'])
], Course);
//# sourceMappingURL=course.entity.js.map
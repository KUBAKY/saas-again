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
exports.Booking = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const coach_entity_1 = require("./coach.entity");
const course_entity_1 = require("./course.entity");
const store_entity_1 = require("./store.entity");
let Booking = class Booking extends base_entity_1.BaseEntity {
    bookingNumber;
    startTime;
    endTime;
    status;
    cost;
    paymentMethod;
    cancelledAt;
    cancellationReason;
    notes;
    rating;
    review;
    reviewedAt;
    memberId;
    coachId;
    courseId;
    storeId;
    member;
    coach;
    course;
    store;
    isConfirmed() {
        return this.status === 'confirmed';
    }
    isCancellable() {
        if (this.status !== 'confirmed')
            return false;
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        return new Date(this.startTime) > twoHoursFromNow;
    }
    isCompleted() {
        return this.status === 'completed';
    }
    isPast() {
        return new Date(this.endTime) < new Date();
    }
    isCurrent() {
        const now = new Date();
        return new Date(this.startTime) <= now && new Date(this.endTime) >= now;
    }
    isUpcoming() {
        return new Date(this.startTime) > new Date();
    }
    getDuration() {
        const diffMs = new Date(this.endTime).getTime() - new Date(this.startTime).getTime();
        return Math.floor(diffMs / (1000 * 60));
    }
    confirm() {
        if (this.status === 'pending') {
            this.status = 'confirmed';
        }
    }
    cancel(reason) {
        if (!this.isCancellable())
            return false;
        this.status = 'cancelled';
        this.cancelledAt = new Date();
        this.cancellationReason = reason;
        return true;
    }
    complete() {
        if (this.status === 'confirmed' && this.isPast()) {
            this.status = 'completed';
        }
    }
    markNoShow() {
        if (this.status === 'confirmed' && this.isPast()) {
            this.status = 'no_show';
        }
    }
    addReview(rating, review) {
        if (this.status === 'completed' && !this.rating) {
            this.rating = Math.max(1, Math.min(5, Math.round(rating)));
            this.review = review;
            this.reviewedAt = new Date();
        }
    }
    hasReview() {
        return !!this.rating;
    }
    getTimeUntilStart() {
        const now = new Date();
        const start = new Date(this.startTime);
        const diffMs = start.getTime() - now.getTime();
        return Math.floor(diffMs / (1000 * 60));
    }
};
exports.Booking = Booking;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        unique: true,
        nullable: false,
        comment: '预约编号',
    }),
    __metadata("design:type", String)
], Booking.prototype, "bookingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: false,
        comment: '开始时间',
    }),
    __metadata("design:type", Date)
], Booking.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: false,
        comment: '结束时间',
    }),
    __metadata("design:type", Date)
], Booking.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
        default: 'pending',
        comment: '预约状态',
    }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        comment: '费用',
    }),
    __metadata("design:type", Number)
], Booking.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['membership_card', 'cash', 'online_payment'],
        nullable: true,
        comment: '支付方式',
    }),
    __metadata("design:type", String)
], Booking.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: '取消时间',
    }),
    __metadata("design:type", Date)
], Booking.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '取消原因',
    }),
    __metadata("design:type", String)
], Booking.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], Booking.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: true,
        comment: '评分（1-5）',
    }),
    __metadata("design:type", Number)
], Booking.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '评价内容',
    }),
    __metadata("design:type", String)
], Booking.prototype, "review", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: '评价时间',
    }),
    __metadata("design:type", Date)
], Booking.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Booking.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'coach_id',
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", String)
], Booking.prototype, "coachId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'course_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Booking.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Booking.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (member) => member.bookings, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], Booking.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coach_entity_1.Coach, (coach) => coach.bookings, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", coach_entity_1.Coach)
], Booking.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, (course) => course.bookings, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], Booking.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => store_entity_1.Store, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'store_id' }),
    __metadata("design:type", store_entity_1.Store)
], Booking.prototype, "store", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Entity)('bookings'),
    (0, typeorm_1.Index)(['memberId', 'startTime']),
    (0, typeorm_1.Index)(['coachId', 'startTime']),
    (0, typeorm_1.Index)(['courseId', 'startTime'])
], Booking);
//# sourceMappingURL=booking.entity.js.map
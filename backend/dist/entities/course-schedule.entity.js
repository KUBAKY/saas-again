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
exports.CourseSchedule = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const course_entity_1 = require("./course.entity");
const coach_entity_1 = require("./coach.entity");
const store_entity_1 = require("./store.entity");
const booking_entity_1 = require("./booking.entity");
let CourseSchedule = class CourseSchedule extends base_entity_1.BaseEntity {
    startTime;
    endTime;
    location;
    maxParticipants;
    currentParticipants;
    price;
    status;
    notes;
    cancelledAt;
    cancellationReason;
    courseId;
    coachId;
    storeId;
    course;
    coach;
    store;
    bookings;
    isAvailable() {
        return (this.status === 'scheduled' &&
            this.currentParticipants < this.maxParticipants &&
            new Date(this.startTime) > new Date());
    }
    isFull() {
        return this.currentParticipants >= this.maxParticipants;
    }
    canCancel() {
        if (this.status !== 'scheduled')
            return false;
        const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
        return new Date(this.startTime) > threeHoursFromNow;
    }
    addParticipant() {
        if (!this.isAvailable())
            return false;
        this.currentParticipants += 1;
        return true;
    }
    removeParticipant() {
        if (this.currentParticipants <= 0)
            return false;
        this.currentParticipants -= 1;
        return true;
    }
    getActualPrice() {
        return this.price || this.course?.price || 0;
    }
    getDuration() {
        const diffMs = new Date(this.endTime).getTime() - new Date(this.startTime).getTime();
        return Math.floor(diffMs / (1000 * 60));
    }
    isUpcoming() {
        return new Date(this.startTime) > new Date();
    }
    isOngoing() {
        const now = new Date();
        return new Date(this.startTime) <= now && new Date(this.endTime) >= now;
    }
    isPast() {
        return new Date(this.endTime) < new Date();
    }
    cancel(reason) {
        if (!this.canCancel())
            return false;
        this.status = 'cancelled';
        this.cancelledAt = new Date();
        this.cancellationReason = reason;
        return true;
    }
    complete() {
        this.status = 'completed';
    }
    start() {
        if (this.status === 'scheduled') {
            this.status = 'ongoing';
        }
    }
};
exports.CourseSchedule = CourseSchedule;
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: false,
        comment: '开始时间',
    }),
    __metadata("design:type", Date)
], CourseSchedule.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: false,
        comment: '结束时间',
    }),
    __metadata("design:type", Date)
], CourseSchedule.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '上课地点/教室',
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: false,
        comment: '最大参与人数',
    }),
    __metadata("design:type", Number)
], CourseSchedule.prototype, "maxParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '当前预约人数',
    }),
    __metadata("design:type", Number)
], CourseSchedule.prototype, "currentParticipants", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        comment: '本次课程价格（可覆盖课程默认价格）',
    }),
    __metadata("design:type", Number)
], CourseSchedule.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled',
        comment: '排课状态',
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: '取消时间',
    }),
    __metadata("design:type", Date)
], CourseSchedule.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '取消原因',
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'course_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'coach_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "coachId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], CourseSchedule.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, (course) => course.schedules, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], CourseSchedule.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coach_entity_1.Coach, (coach) => coach.schedules, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'coach_id' }),
    __metadata("design:type", coach_entity_1.Coach)
], CourseSchedule.prototype, "coach", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => store_entity_1.Store, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'store_id' }),
    __metadata("design:type", store_entity_1.Store)
], CourseSchedule.prototype, "store", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.courseSchedule),
    __metadata("design:type", Array)
], CourseSchedule.prototype, "bookings", void 0);
exports.CourseSchedule = CourseSchedule = __decorate([
    (0, typeorm_1.Entity)('course_schedules'),
    (0, typeorm_1.Index)(['storeId', 'startTime']),
    (0, typeorm_1.Index)(['courseId', 'startTime']),
    (0, typeorm_1.Index)(['coachId', 'startTime'])
], CourseSchedule);
//# sourceMappingURL=course-schedule.entity.js.map
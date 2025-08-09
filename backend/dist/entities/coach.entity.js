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
exports.Coach = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const store_entity_1 = require("./store.entity");
const course_entity_1 = require("./course.entity");
const booking_entity_1 = require("./booking.entity");
let Coach = class Coach extends base_entity_1.BaseEntity {
    employeeNumber;
    name;
    phone;
    email;
    gender;
    birthday;
    avatar;
    bio;
    specialties;
    certifications;
    experienceYears;
    rating;
    reviewCount;
    hireDate;
    baseSalary;
    hourlyRate;
    commissionRate;
    workSchedule;
    status;
    notes;
    storeId;
    store;
    courses;
    bookings;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    isAvailable() {
        return this.isActive() && this.status !== 'on_leave';
    }
    getAge() {
        if (!this.birthday)
            return null;
        const today = new Date();
        const birthDate = new Date(this.birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    getWorkExperience() {
        const today = new Date();
        const hireYear = new Date(this.hireDate).getFullYear();
        return today.getFullYear() - hireYear;
    }
    hasSpecialty(specialty) {
        return this.specialties?.includes(specialty) || false;
    }
    isAvailableAt(dayOfWeek, time) {
        if (!this.workSchedule || !this.workSchedule[dayOfWeek]) {
            return false;
        }
        const schedule = this.workSchedule[dayOfWeek];
        if (!schedule.available)
            return false;
        const timeMinutes = this.timeToMinutes(time);
        const startMinutes = this.timeToMinutes(schedule.start);
        const endMinutes = this.timeToMinutes(schedule.end);
        return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    }
    updateRating(newRating) {
        const totalScore = this.rating * this.reviewCount + newRating;
        this.reviewCount += 1;
        this.rating = Math.round((totalScore / this.reviewCount) * 100) / 100;
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    getTotalCourses() {
        return this.courses?.length || 0;
    }
    getActiveCourses() {
        return this.courses?.filter(course => course.isActive()) || [];
    }
};
exports.Coach = Coach;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        unique: true,
        nullable: false,
        comment: '教练工号',
    }),
    __metadata("design:type", String)
], Coach.prototype, "employeeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '教练姓名',
    }),
    __metadata("design:type", String)
], Coach.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: false,
        comment: '手机号码',
    }),
    __metadata("design:type", String)
], Coach.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '邮箱地址',
    }),
    __metadata("design:type", String)
], Coach.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['male', 'female', 'other'],
        nullable: false,
        comment: '性别',
    }),
    __metadata("design:type", String)
], Coach.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: true,
        comment: '生日',
    }),
    __metadata("design:type", Date)
], Coach.prototype, "birthday", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '头像URL',
    }),
    __metadata("design:type", String)
], Coach.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '个人简介',
    }),
    __metadata("design:type", String)
], Coach.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '专业技能',
    }),
    __metadata("design:type", Array)
], Coach.prototype, "specialties", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '资格证书',
    }),
    __metadata("design:type", Array)
], Coach.prototype, "certifications", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: true,
        comment: '从业年限',
    }),
    __metadata("design:type", Number)
], Coach.prototype, "experienceYears", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 5.0,
        comment: '平均评分',
    }),
    __metadata("design:type", Number)
], Coach.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '评价总数',
    }),
    __metadata("design:type", Number)
], Coach.prototype, "reviewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        comment: '入职日期',
    }),
    __metadata("design:type", Date)
], Coach.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        comment: '基本工资',
    }),
    __metadata("design:type", Number)
], Coach.prototype, "baseSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: '课时费',
    }),
    __metadata("design:type", Number)
], Coach.prototype, "hourlyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
        comment: '提成比例',
    }),
    __metadata("design:type", Number)
], Coach.prototype, "commissionRate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '工作时间安排',
    }),
    __metadata("design:type", Object)
], Coach.prototype, "workSchedule", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'on_leave', 'resigned'],
        default: 'active',
        comment: '教练状态',
    }),
    __metadata("design:type", String)
], Coach.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], Coach.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Coach.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => store_entity_1.Store, (store) => store.coaches, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'store_id' }),
    __metadata("design:type", store_entity_1.Store)
], Coach.prototype, "store", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_entity_1.Course, (course) => course.coach),
    __metadata("design:type", Array)
], Coach.prototype, "courses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => booking_entity_1.Booking, (booking) => booking.coach),
    __metadata("design:type", Array)
], Coach.prototype, "bookings", void 0);
exports.Coach = Coach = __decorate([
    (0, typeorm_1.Entity)('coaches'),
    (0, typeorm_1.Index)(['employeeNumber'], { unique: true })
], Coach);
//# sourceMappingURL=coach.entity.js.map
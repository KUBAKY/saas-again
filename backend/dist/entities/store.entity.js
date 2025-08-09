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
exports.Store = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const brand_entity_1 = require("./brand.entity");
const user_entity_1 = require("./user.entity");
let Store = class Store extends base_entity_1.BaseEntity {
    name;
    code;
    description;
    address;
    phone;
    email;
    latitude;
    longitude;
    openTime;
    closeTime;
    area;
    capacity;
    facilities;
    settings;
    status;
    brandId;
    brand;
    employees;
    members;
    coaches;
    courses;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    isOpen(time = new Date()) {
        const currentHour = time.getHours();
        const currentMinute = time.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const [openHour, openMinute] = this.openTime.split(':').map(Number);
        const openTimeMinutes = openHour * 60 + openMinute;
        const [closeHour, closeMinute] = this.closeTime.split(':').map(Number);
        const closeTimeMinutes = closeHour * 60 + closeMinute;
        return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
    }
    getDistance(lat, lng) {
        if (!this.latitude || !this.longitude)
            return Infinity;
        const R = 6371;
        const dLat = this.toRad(lat - this.latitude);
        const dLon = this.toRad(lng - this.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(this.latitude)) *
                Math.cos(this.toRad(lat)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(value) {
        return (value * Math.PI) / 180;
    }
};
exports.Store = Store;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '门店名称',
    }),
    __metadata("design:type", String)
], Store.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: false,
        comment: '门店代码',
    }),
    __metadata("design:type", String)
], Store.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '门店描述',
    }),
    __metadata("design:type", String)
], Store.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: false,
        comment: '门店地址',
    }),
    __metadata("design:type", String)
], Store.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: false,
        comment: '联系电话',
    }),
    __metadata("design:type", String)
], Store.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '联系邮箱',
    }),
    __metadata("design:type", String)
], Store.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
        comment: '纬度',
    }),
    __metadata("design:type", Number)
], Store.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
        comment: '经度',
    }),
    __metadata("design:type", Number)
], Store.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: false,
        comment: '营业时间开始',
    }),
    __metadata("design:type", String)
], Store.prototype, "openTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: false,
        comment: '营业时间结束',
    }),
    __metadata("design:type", String)
], Store.prototype, "closeTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        comment: '门店面积（平方米）',
    }),
    __metadata("design:type", Number)
], Store.prototype, "area", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        nullable: true,
        comment: '最大容纳人数',
    }),
    __metadata("design:type", Number)
], Store.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '门店设施信息',
    }),
    __metadata("design:type", Array)
], Store.prototype, "facilities", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '门店配置信息',
    }),
    __metadata("design:type", Object)
], Store.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active',
        comment: '门店状态',
    }),
    __metadata("design:type", String)
], Store.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'brand_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Store.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => brand_entity_1.Brand, (brand) => brand.stores, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'brand_id' }),
    __metadata("design:type", brand_entity_1.Brand)
], Store.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.store),
    __metadata("design:type", Array)
], Store.prototype, "employees", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Member', (member) => member.store),
    __metadata("design:type", Array)
], Store.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Coach', (coach) => coach.store),
    __metadata("design:type", Array)
], Store.prototype, "coaches", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Course', (course) => course.store),
    __metadata("design:type", Array)
], Store.prototype, "courses", void 0);
exports.Store = Store = __decorate([
    (0, typeorm_1.Entity)('stores'),
    (0, typeorm_1.Index)(['brandId', 'code'], { unique: true })
], Store);
//# sourceMappingURL=store.entity.js.map
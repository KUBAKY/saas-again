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
exports.CheckIn = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const store_entity_1 = require("./store.entity");
let CheckIn = class CheckIn extends base_entity_1.BaseEntity {
    checkInTime;
    checkOutTime;
    method;
    deviceInfo;
    notes;
    memberId;
    storeId;
    member;
    store;
    getDuration() {
        if (!this.checkOutTime)
            return null;
        const diffMs = new Date(this.checkOutTime).getTime() -
            new Date(this.checkInTime).getTime();
        return Math.floor(diffMs / (1000 * 60));
    }
    isCurrentlyInside() {
        return !this.checkOutTime;
    }
    checkOut(time = new Date()) {
        if (!this.checkOutTime) {
            this.checkOutTime = time;
        }
    }
};
exports.CheckIn = CheckIn;
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: false,
        comment: '签到时间',
    }),
    __metadata("design:type", Date)
], CheckIn.prototype, "checkInTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        nullable: true,
        comment: '签出时间',
    }),
    __metadata("design:type", Date)
], CheckIn.prototype, "checkOutTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['manual', 'qr_code', 'nfc', 'app'],
        default: 'app',
        comment: '签到方式',
    }),
    __metadata("design:type", String)
], CheckIn.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '签到设备信息',
    }),
    __metadata("design:type", String)
], CheckIn.prototype, "deviceInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '备注信息',
    }),
    __metadata("design:type", String)
], CheckIn.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], CheckIn.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], CheckIn.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (member) => member.checkIns, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], CheckIn.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => store_entity_1.Store, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'store_id' }),
    __metadata("design:type", store_entity_1.Store)
], CheckIn.prototype, "store", void 0);
exports.CheckIn = CheckIn = __decorate([
    (0, typeorm_1.Entity)('check_ins'),
    (0, typeorm_1.Index)(['memberId', 'checkInTime']),
    (0, typeorm_1.Index)(['storeId', 'checkInTime'])
], CheckIn);
//# sourceMappingURL=check-in.entity.js.map
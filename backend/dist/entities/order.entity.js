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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const payment_entity_1 = require("./payment.entity");
let Order = class Order extends base_entity_1.BaseEntity {
    orderNumber;
    type;
    status;
    totalAmount;
    discountAmount;
    paidAmount;
    description;
    paidAt;
    cancelledAt;
    cancelReason;
    expiresAt;
    orderDetails;
    metadata;
    memberId;
    storeId;
    brandId;
    member;
    payments;
    isPaid() {
        return this.status === 'paid';
    }
    isCancelled() {
        return this.status === 'cancelled';
    }
    isExpired() {
        return (this.status === 'expired' ||
            (this.expiresAt ? this.expiresAt < new Date() : false));
    }
    canCancel() {
        return this.status === 'pending';
    }
    canRefund() {
        return this.status === 'paid';
    }
    getTotalPaidAmount() {
        return (this.payments
            ?.filter((payment) => payment.status === 'completed')
            ?.reduce((sum, payment) => sum + payment.amount, 0) || 0);
    }
    getRemainingAmount() {
        return Math.max(0, this.paidAmount - this.getTotalPaidAmount());
    }
    isFullyPaid() {
        return this.getTotalPaidAmount() >= this.paidAmount;
    }
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false,
        comment: '订单号',
    }),
    __metadata("design:type", String)
], Order.prototype, "orderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['membership_card', 'course', 'personal_training', 'product'],
        nullable: false,
        comment: '订单类型',
    }),
    __metadata("design:type", String)
], Order.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'paid', 'cancelled', 'refunded', 'expired'],
        default: 'pending',
        comment: '订单状态',
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '订单总金额',
    }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        comment: '折扣金额',
    }),
    __metadata("design:type", Number)
], Order.prototype, "discountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '实付金额',
    }),
    __metadata("design:type", Number)
], Order.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 200,
        nullable: true,
        comment: '订单描述',
    }),
    __metadata("design:type", String)
], Order.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: true,
        comment: '支付时间',
    }),
    __metadata("design:type", Date)
], Order.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: true,
        comment: '取消时间',
    }),
    __metadata("design:type", Date)
], Order.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 200,
        nullable: true,
        comment: '取消原因',
    }),
    __metadata("design:type", String)
], Order.prototype, "cancelReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: true,
        comment: '过期时间',
    }),
    __metadata("design:type", Date)
], Order.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '订单详情',
    }),
    __metadata("design:type", Object)
], Order.prototype, "orderDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '订单元数据',
    }),
    __metadata("design:type", Object)
], Order.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'member_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Order.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Order.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'brand_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Order.prototype, "brandId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (member) => member.orders, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], Order.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.order),
    __metadata("design:type", Array)
], Order.prototype, "payments", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders'),
    (0, typeorm_1.Index)(['orderNumber'], { unique: true })
], Order);
//# sourceMappingURL=order.entity.js.map
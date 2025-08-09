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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const order_entity_1 = require("./order.entity");
let Payment = class Payment extends base_entity_1.BaseEntity {
    paymentNumber;
    amount;
    paymentMethod;
    status;
    description;
    thirdPartyTransactionId;
    paidAt;
    cancelledAt;
    cancelReason;
    refundAmount;
    refundReason;
    refundedAt;
    metadata;
    orderId;
    storeId;
    order;
    isCompleted() {
        return this.status === 'completed';
    }
    canRefund() {
        return this.status === 'completed' && this.refundAmount < this.amount;
    }
    getRemainingRefundAmount() {
        return this.amount - (this.refundAmount || 0);
    }
    isFullyRefunded() {
        return this.refundAmount >= this.amount;
    }
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false,
        comment: '支付单号',
    }),
    __metadata("design:type", String)
], Payment.prototype, "paymentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: '支付金额',
    }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['wechat', 'alipay', 'cash', 'card', 'transfer'],
        nullable: false,
        comment: '支付方式',
    }),
    __metadata("design:type", String)
], Payment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending',
        comment: '支付状态',
    }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 200,
        nullable: true,
        comment: '支付描述',
    }),
    __metadata("design:type", String)
], Payment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '第三方交易ID',
    }),
    __metadata("design:type", String)
], Payment.prototype, "thirdPartyTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: true,
        comment: '支付完成时间',
    }),
    __metadata("design:type", Date)
], Payment.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: true,
        comment: '取消时间',
    }),
    __metadata("design:type", Date)
], Payment.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 200,
        nullable: true,
        comment: '取消原因',
    }),
    __metadata("design:type", String)
], Payment.prototype, "cancelReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        comment: '退款金额',
    }),
    __metadata("design:type", Number)
], Payment.prototype, "refundAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 200,
        nullable: true,
        comment: '退款原因',
    }),
    __metadata("design:type", String)
], Payment.prototype, "refundReason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        nullable: true,
        comment: '退款时间',
    }),
    __metadata("design:type", Date)
], Payment.prototype, "refundedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '支付元数据',
    }),
    __metadata("design:type", Object)
], Payment.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'order_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Payment.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'store_id',
        type: 'uuid',
        nullable: false,
    }),
    __metadata("design:type", String)
], Payment.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.Order, (order) => order.payments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], Payment.prototype, "order", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)('payments'),
    (0, typeorm_1.Index)(['paymentNumber'], { unique: true })
], Payment);
//# sourceMappingURL=payment.entity.js.map
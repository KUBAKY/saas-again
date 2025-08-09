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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../entities/payment.entity");
const order_entity_1 = require("../entities/order.entity");
const permission_util_1 = require("../common/utils/permission.util");
let PaymentsService = class PaymentsService {
    paymentRepository;
    orderRepository;
    constructor(paymentRepository, orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }
    async create(createPaymentDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'create');
        const order = await this.orderRepository.findOne({
            where: {
                id: createPaymentDto.orderId,
                storeId: currentUser.storeId,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status === 'paid') {
            throw new common_1.ConflictException('订单已支付');
        }
        if (order.status === 'cancelled') {
            throw new common_1.BadRequestException('订单已取消，无法支付');
        }
        if (createPaymentDto.amount <= 0) {
            throw new common_1.BadRequestException('支付金额必须大于0');
        }
        if (createPaymentDto.amount > order.totalAmount) {
            throw new common_1.BadRequestException('支付金额不能超过订单金额');
        }
        const paymentNumber = this.generatePaymentNumber();
        const payment = this.paymentRepository.create({
            ...createPaymentDto,
            paymentNumber,
            order,
            status: 'pending',
            storeId: currentUser.storeId,
            createdBy: currentUser.id,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        await this.processPayment(savedPayment, currentUser);
        return savedPayment;
    }
    async findAll(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'read');
        const { page = 1, limit = 20, orderId, paymentMethod, status, startDate, endDate, } = queryDto;
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.order', 'order')
            .where('payment.storeId = :storeId', { storeId: currentUser.storeId });
        if (currentUser.storeId) {
            queryBuilder.andWhere('payment.storeId = :storeId', {
                storeId: currentUser.storeId,
            });
        }
        else if (currentUser.brandId) {
            queryBuilder.andWhere('order.brandId = :brandId', {
                brandId: currentUser.brandId,
            });
        }
        if (orderId) {
            queryBuilder.andWhere('payment.orderId = :orderId', {
                orderId,
            });
        }
        if (paymentMethod) {
            queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', {
                paymentMethod,
            });
        }
        if (status) {
            queryBuilder.andWhere('payment.status = :status', { status });
        }
        if (startDate) {
            queryBuilder.andWhere('payment.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('payment.createdAt <= :endDate', { endDate });
        }
        const [items, total] = await queryBuilder
            .orderBy('payment.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'read');
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.order', 'order')
            .where('payment.id = :id', { id })
            .andWhere('payment.storeId = :storeId', { storeId: currentUser.storeId });
        if (currentUser.storeId) {
            queryBuilder.andWhere('payment.storeId = :storeId', {
                storeId: currentUser.storeId,
            });
        }
        const payment = await queryBuilder.getOne();
        if (!payment) {
            throw new common_1.NotFoundException('支付记录不存在');
        }
        return payment;
    }
    async confirmPayment(id, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'update');
        const payment = await this.findOne(id, currentUser);
        if (payment.status !== 'pending') {
            throw new common_1.BadRequestException('支付状态不正确');
        }
        payment.status = 'completed';
        payment.paidAt = new Date();
        payment.updatedBy = currentUser.id;
        const order = payment.order;
        order.status = 'paid';
        order.paidAt = new Date();
        order.updatedBy = currentUser.id;
        await this.orderRepository.save(order);
        return await this.paymentRepository.save(payment);
    }
    async cancelPayment(id, reason, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'update');
        const payment = await this.findOne(id, currentUser);
        if (payment.status !== 'pending') {
            throw new common_1.BadRequestException('只能取消待支付的订单');
        }
        payment.status = 'cancelled';
        payment.cancelledAt = new Date();
        payment.cancelReason = reason;
        payment.updatedBy = currentUser.id;
        return await this.paymentRepository.save(payment);
    }
    async refund(refundDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'update');
        const payment = await this.findOne(refundDto.paymentId, currentUser);
        if (payment.status !== 'completed') {
            throw new common_1.BadRequestException('只能退款已完成的支付');
        }
        const refundAmount = refundDto.amount || payment.amount;
        if (refundAmount <= 0 || refundAmount > payment.amount) {
            throw new common_1.BadRequestException('退款金额不正确');
        }
        const existingRefund = payment.refundAmount || 0;
        if (existingRefund + refundAmount > payment.amount) {
            throw new common_1.BadRequestException('退款金额超过支付金额');
        }
        payment.refundAmount = existingRefund + refundAmount;
        payment.refundReason = refundDto.reason;
        payment.refundedAt = new Date();
        payment.updatedBy = currentUser.id;
        if (payment.refundAmount >= payment.amount) {
            payment.status = 'refunded';
            const order = payment.order;
            order.status = 'refunded';
            order.updatedBy = currentUser.id;
            await this.orderRepository.save(order);
        }
        return await this.paymentRepository.save(payment);
    }
    async getStats(currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'read');
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .where('payment.storeId = :storeId', { storeId: currentUser.storeId });
        if (currentUser.storeId) {
            queryBuilder.andWhere('payment.storeId = :storeId', {
                storeId: currentUser.storeId,
            });
        }
        const [total, completed, pending, cancelled, refunded] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder
                .clone()
                .andWhere('payment.status = :status', { status: 'completed' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('payment.status = :status', { status: 'pending' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('payment.status = :status', { status: 'cancelled' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('payment.status = :status', { status: 'refunded' })
                .getCount(),
        ]);
        const revenueStats = await queryBuilder
            .select('SUM(payment.amount)', 'totalRevenue')
            .addSelect("SUM(CASE WHEN payment.status = 'completed' THEN payment.amount ELSE 0 END)", 'completedRevenue')
            .addSelect('SUM(payment.refundAmount)', 'refundedAmount')
            .getRawOne();
        return {
            total,
            completed,
            pending,
            cancelled,
            refunded,
            totalRevenue: parseFloat(revenueStats.totalRevenue) || 0,
            completedRevenue: parseFloat(revenueStats.completedRevenue) || 0,
            refundedAmount: parseFloat(revenueStats.refundedAmount) || 0,
        };
    }
    generatePaymentNumber() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `PAY${timestamp}${random}`;
    }
    async processPayment(payment, currentUser) {
        switch (payment.paymentMethod) {
            case 'cash':
            case 'card':
                await this.confirmPayment(payment.id, currentUser);
                break;
            case 'wechat':
            case 'alipay':
                payment.thirdPartyTransactionId = this.generateThirdPartyId();
                await this.paymentRepository.save(payment);
                break;
            case 'transfer':
                break;
            default:
                throw new common_1.BadRequestException('不支持的支付方式');
        }
    }
    generateThirdPartyId() {
        return `TXN${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
    }
    async createInstallmentPayment(orderId, installmentPlan, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'create');
        const order = await this.orderRepository.findOne({
            where: { id: orderId, storeId: currentUser.storeId },
        });
        if (!order) {
            throw new common_1.NotFoundException('订单不存在');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException('订单状态不允许分期付款');
        }
        const { totalAmount, installments, firstPaymentAmount } = installmentPlan;
        const payments = [];
        const firstAmount = firstPaymentAmount || Math.ceil(totalAmount / installments);
        const remainingAmount = totalAmount - firstAmount;
        const monthlyAmount = Math.ceil(remainingAmount / (installments - 1));
        const firstPayment = this.paymentRepository.create({
            orderId,
            amount: firstAmount,
            paymentMethod: 'card',
            paymentNumber: this.generatePaymentNumber(),
            description: `分期付款 1/${installments}`,
            status: 'pending',
            storeId: currentUser.storeId,
            createdBy: currentUser.id,
            order,
            metadata: {
                installmentInfo: {
                    isInstallment: true,
                    currentInstallment: 1,
                    totalInstallments: installments,
                    totalAmount,
                },
            },
        });
        payments.push(await this.paymentRepository.save(firstPayment));
        for (let i = 2; i <= installments; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i - 1);
            const amount = i === installments
                ? totalAmount - firstAmount - monthlyAmount * (installments - 2)
                : monthlyAmount;
            const installmentPayment = this.paymentRepository.create({
                amount,
                paymentMethod: 'card',
                paymentNumber: this.generatePaymentNumber(),
                description: `分期付款 ${i}/${installments}`,
                status: 'pending',
                storeId: currentUser.storeId,
                createdBy: currentUser.id,
                order,
                metadata: {
                    installmentInfo: {
                        isInstallment: true,
                        currentInstallment: i,
                        totalInstallments: installments,
                        totalAmount,
                        dueDate,
                    },
                },
            });
            const savedPayment = await this.paymentRepository.save(installmentPayment);
            payments.push(savedPayment);
        }
        return payments;
    }
    async applyCoupon(paymentId, couponCode, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'update');
        const payment = await this.findOne(paymentId, currentUser);
        if (payment.status !== 'pending') {
            throw new common_1.BadRequestException('只能对待支付订单应用优惠券');
        }
        const couponDiscount = await this.validateCoupon(couponCode, payment.amount);
        if (!couponDiscount) {
            throw new common_1.BadRequestException('优惠券无效或已过期');
        }
        const discountAmount = Math.min(couponDiscount.amount, payment.amount);
        const finalAmount = Math.max(0, payment.amount - discountAmount);
        payment.amount = finalAmount;
        payment.metadata = {
            ...payment.metadata,
            coupon: {
                code: couponCode,
                discountAmount,
                originalAmount: payment.amount + discountAmount,
            },
        };
        return await this.paymentRepository.save(payment);
    }
    async batchRefund(refundRequests, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'update');
        let success = 0;
        let failed = 0;
        const results = [];
        for (const request of refundRequests) {
            try {
                await this.refund(request, currentUser);
                results.push({ paymentId: request.paymentId, success: true });
                success++;
            }
            catch (error) {
                results.push({
                    paymentId: request.paymentId,
                    success: false,
                    error: error.message,
                });
                failed++;
            }
        }
        return { success, failed, results };
    }
    async getPaymentTrends(startDate, endDate, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'read');
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .where('payment.storeId = :storeId', { storeId: currentUser.storeId })
            .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
        });
        const dailyStats = await queryBuilder
            .clone()
            .select('DATE(payment.createdAt)', 'date')
            .addSelect('SUM(payment.amount)', 'amount')
            .addSelect('COUNT(*)', 'count')
            .groupBy('DATE(payment.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        const dailyTrends = dailyStats.map((stat) => ({
            date: stat.date,
            amount: parseFloat(stat.amount) || 0,
            count: parseInt(stat.count) || 0,
        }));
        const methodStats = await queryBuilder
            .clone()
            .select('payment.paymentMethod', 'method')
            .addSelect('SUM(payment.amount)', 'amount')
            .groupBy('payment.paymentMethod')
            .getRawMany();
        const totalMethodAmount = methodStats.reduce((sum, stat) => sum + (parseFloat(stat.amount) || 0), 0);
        const methodTrends = methodStats.map((stat) => ({
            method: stat.method,
            amount: parseFloat(stat.amount) || 0,
            percentage: totalMethodAmount > 0
                ? Math.round(((parseFloat(stat.amount) || 0) / totalMethodAmount) * 100)
                : 0,
        }));
        const statusStats = await queryBuilder
            .clone()
            .select('payment.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('payment.status')
            .getRawMany();
        const totalStatusCount = statusStats.reduce((sum, stat) => sum + (parseInt(stat.count) || 0), 0);
        const statusDistribution = statusStats.map((stat) => ({
            status: stat.status,
            count: parseInt(stat.count) || 0,
            percentage: totalStatusCount > 0
                ? Math.round(((parseInt(stat.count) || 0) / totalStatusCount) * 100)
                : 0,
        }));
        const overallStats = await queryBuilder
            .clone()
            .select('COUNT(*)', 'totalTransactions')
            .addSelect('SUM(payment.amount)', 'totalRevenue')
            .addSelect('AVG(payment.amount)', 'averageTransactionValue')
            .getRawOne();
        return {
            dailyTrends,
            methodTrends,
            statusDistribution,
            totalTransactions: parseInt(overallStats.totalTransactions) || 0,
            totalRevenue: parseFloat(overallStats.totalRevenue) || 0,
            averageTransactionValue: parseFloat(overallStats.averageTransactionValue) || 0,
        };
    }
    async processOverdueInstallments() {
        const now = new Date();
        const errors = [];
        let processed = 0;
        let notified = 0;
        const overduePayments = await this.paymentRepository
            .createQueryBuilder('payment')
            .where('payment.status = :status', { status: 'scheduled' })
            .andWhere("payment.metadata->>'installmentInfo' IS NOT NULL")
            .andWhere("(payment.metadata->'installmentInfo'->>'dueDate')::timestamp < :now", { now })
            .getMany();
        for (const payment of overduePayments) {
            try {
                payment.status = 'failed';
                payment.metadata = {
                    ...payment.metadata,
                    overdueInfo: {
                        overdueDate: now,
                        daysPastDue: Math.ceil((now.getTime() -
                            new Date(payment.metadata?.installmentInfo?.dueDate || now).getTime()) /
                            (1000 * 60 * 60 * 24)),
                    },
                };
                await this.paymentRepository.save(payment);
                processed++;
                notified++;
            }
            catch (error) {
                errors.push(`处理逾期付款 ${payment.id} 失败: ${error.message}`);
            }
        }
        return { processed, notified, errors };
    }
    async getRiskAnalysis(currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'payment', 'read');
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .where('payment.storeId = :storeId', { storeId: currentUser.storeId })
            .andWhere('payment.createdAt >= :startDate', { startDate: last30Days });
        const highRiskTransactions = await queryBuilder
            .clone()
            .andWhere('payment.paymentMethod = :method', { method: 'cash' })
            .andWhere('payment.amount > :amount', { amount: 1000 })
            .getCount();
        const suspiciousPatterns = [];
        const frequentRefunds = await queryBuilder
            .clone()
            .andWhere('payment.status = :status', { status: 'refunded' })
            .getCount();
        if (frequentRefunds > 10) {
            suspiciousPatterns.push({
                type: 'frequent_refunds',
                count: frequentRefunds,
                description: '频繁退款可能表明服务质量问题',
            });
        }
        const largeCashTransactions = await queryBuilder
            .clone()
            .andWhere('payment.paymentMethod = :method', { method: 'cash' })
            .andWhere('payment.amount > :amount', { amount: 500 })
            .getCount();
        if (largeCashTransactions > 5) {
            suspiciousPatterns.push({
                type: 'large_cash_transactions',
                count: largeCashTransactions,
                description: '大额现金交易需要额外关注',
            });
        }
        const totalTransactions = await queryBuilder.clone().getCount();
        const chargebackRate = totalTransactions > 0
            ? Math.round((frequentRefunds / totalTransactions) * 100)
            : 0;
        let fraudScore = 0;
        fraudScore += Math.min(chargebackRate * 2, 40);
        fraudScore += Math.min(highRiskTransactions, 30);
        fraudScore += Math.min(suspiciousPatterns.length * 10, 30);
        return {
            highRiskTransactions,
            suspiciousPatterns,
            chargebackRate,
            fraudScore: Math.min(fraudScore, 100),
        };
    }
    async validateCoupon(couponCode, orderAmount) {
        const coupons = {
            SAVE10: { amount: 10, type: 'fixed' },
            DISCOUNT20: { amount: 20, type: 'percentage' },
            WELCOME50: { amount: 50, type: 'fixed' },
        };
        const coupon = coupons[couponCode];
        if (!coupon)
            return null;
        if (coupon.type === 'percentage') {
            return {
                amount: Math.round((orderAmount * coupon.amount) / 100),
                type: coupon.type,
            };
        }
        return coupon;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { checkPermission } from '../common/utils/permission.util';

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  paymentMethod: 'wechat' | 'alipay' | 'cash' | 'card' | 'transfer';
  description?: string;
  metadata?: Record<string, any>;
}

export interface RefundDto {
  paymentId: string;
  amount?: number; // 部分退款金额，不传则全额退款
  reason: string;
}

export interface QueryPaymentDto {
  page?: number;
  limit?: number;
  orderId?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  /**
   * 创建支付记录
   */
  async create(
    createPaymentDto: CreatePaymentDto,
    currentUser: User,
  ): Promise<Payment> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'create');

    // 验证订单是否存在
    const order = await this.orderRepository.findOne({
      where: {
        id: createPaymentDto.orderId,
        storeId: currentUser.storeId,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查订单状态
    if (order.status === 'paid') {
      throw new ConflictException('订单已支付');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('订单已取消，无法支付');
    }

    // 验证支付金额
    if (createPaymentDto.amount <= 0) {
      throw new BadRequestException('支付金额必须大于0');
    }

    if (createPaymentDto.amount > order.totalAmount) {
      throw new BadRequestException('支付金额不能超过订单金额');
    }

    // 生成支付单号
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

    // 根据支付方式处理支付
    await this.processPayment(savedPayment, currentUser);

    return savedPayment;
  }

  /**
   * 查询支付记录
   */
  async findAll(queryDto: QueryPaymentDto, currentUser: User) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'read');

    const {
      page = 1,
      limit = 20,
      orderId,
      paymentMethod,
      status,
      startDate,
      endDate,
    } = queryDto;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .where('payment.storeId = :storeId', { storeId: currentUser.storeId });

    if (currentUser.storeId) {
      queryBuilder.andWhere('payment.storeId = :storeId', {
        storeId: currentUser.storeId,
      });
    } else if (currentUser.brandId) {
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

  /**
   * 获取单个支付记录
   */
  async findOne(id: string, currentUser: User): Promise<Payment> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'read');

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
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  /**
   * 确认支付
   */
  async confirmPayment(id: string, currentUser: User): Promise<Payment> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'update');

    const payment = await this.findOne(id, currentUser);

    if (payment.status !== 'pending') {
      throw new BadRequestException('支付状态不正确');
    }

    payment.status = 'completed';
    payment.paidAt = new Date();
    payment.updatedBy = currentUser.id;

    // 更新订单状态
    const order = payment.order;
    order.status = 'paid';
    order.paidAt = new Date();
    order.updatedBy = currentUser.id;

    await this.orderRepository.save(order);
    return await this.paymentRepository.save(payment);
  }

  /**
   * 取消支付
   */
  async cancelPayment(
    id: string,
    reason: string,
    currentUser: User,
  ): Promise<Payment> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'update');

    const payment = await this.findOne(id, currentUser);

    if (payment.status !== 'pending') {
      throw new BadRequestException('只能取消待支付的订单');
    }

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    payment.cancelReason = reason;
    payment.updatedBy = currentUser.id;

    return await this.paymentRepository.save(payment);
  }

  /**
   * 退款
   */
  async refund(refundDto: RefundDto, currentUser: User): Promise<Payment> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'update');

    const payment = await this.findOne(refundDto.paymentId, currentUser);

    if (payment.status !== 'completed') {
      throw new BadRequestException('只能退款已完成的支付');
    }

    const refundAmount = refundDto.amount || payment.amount;

    if (refundAmount <= 0 || refundAmount > payment.amount) {
      throw new BadRequestException('退款金额不正确');
    }

    // 检查是否已有退款记录
    const existingRefund = payment.refundAmount || 0;
    if (existingRefund + refundAmount > payment.amount) {
      throw new BadRequestException('退款金额超过支付金额');
    }

    payment.refundAmount = existingRefund + refundAmount;
    payment.refundReason = refundDto.reason;
    payment.refundedAt = new Date();
    payment.updatedBy = currentUser.id;

    // 如果全额退款，更新状态
    if (payment.refundAmount >= payment.amount) {
      payment.status = 'refunded';

      // 更新订单状态
      const order = payment.order;
      order.status = 'refunded';
      order.updatedBy = currentUser.id;
      await this.orderRepository.save(order);
    }

    return await this.paymentRepository.save(payment);
  }

  /**
   * 获取支付统计
   */
  async getStats(currentUser: User) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'read');

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

    // 获取收入统计
    const revenueStats = await queryBuilder
      .select('SUM(payment.amount)', 'totalRevenue')
      .addSelect(
        "SUM(CASE WHEN payment.status = 'completed' THEN payment.amount ELSE 0 END)",
        'completedRevenue',
      )
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

  /**
   * 生成支付单号
   */
  private generatePaymentNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY${timestamp}${random}`;
  }

  /**
   * 处理支付
   */
  private async processPayment(
    payment: Payment,
    currentUser: User,
  ): Promise<void> {
    switch (payment.paymentMethod) {
      case 'cash':
      case 'card':
        // 现金和刷卡支付直接确认
        await this.confirmPayment(payment.id, currentUser);
        break;
      case 'wechat':
      case 'alipay':
        // 第三方支付需要调用相应的API
        // 这里暂时模拟，实际需要集成微信支付、支付宝等
        payment.thirdPartyTransactionId = this.generateThirdPartyId();
        await this.paymentRepository.save(payment);
        break;
      case 'transfer':
        // 转账支付需要人工确认
        break;
      default:
        throw new BadRequestException('不支持的支付方式');
    }
  }

  /**
   * 生成第三方交易ID
   */
  private generateThirdPartyId(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * 分期付款
   */
  async createInstallmentPayment(
    orderId: string,
    installmentPlan: {
      totalAmount: number;
      installments: number;
      firstPaymentAmount?: number;
    },
    currentUser: User,
  ): Promise<Payment[]> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'create');

    const order = await this.orderRepository.findOne({
      where: { id: orderId, storeId: currentUser.storeId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('订单状态不允许分期付款');
    }

    const { totalAmount, installments, firstPaymentAmount } = installmentPlan;
    const payments: Payment[] = [];

    // 计算每期金额
    const firstAmount =
      firstPaymentAmount || Math.ceil(totalAmount / installments);
    const remainingAmount = totalAmount - firstAmount;
    const monthlyAmount = Math.ceil(remainingAmount / (installments - 1));

    // 创建首期付款
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

    // 创建后续分期
    for (let i = 2; i <= installments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      const amount =
        i === installments
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

      const savedPayment = await this.paymentRepository.save(
        installmentPayment,
      );
      payments.push(savedPayment);
    }

    return payments;
  }

  /**
   * 应用优惠券
   */
  async applyCoupon(
    paymentId: string,
    couponCode: string,
    currentUser: User,
  ): Promise<Payment> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'update');

    const payment = await this.findOne(paymentId, currentUser);

    if (payment.status !== 'pending') {
      throw new BadRequestException('只能对待支付订单应用优惠券');
    }

    // 模拟优惠券验证（实际应该有专门的优惠券服务）
    const couponDiscount = await this.validateCoupon(
      couponCode,
      payment.amount,
    );

    if (!couponDiscount) {
      throw new BadRequestException('优惠券无效或已过期');
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

  /**
   * 批量退款
   */
  async batchRefund(
    refundRequests: Array<{
      paymentId: string;
      amount?: number;
      reason: string;
    }>,
    currentUser: User,
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ paymentId: string; success: boolean; error?: string }>;
  }> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'update');

    let success = 0;
    let failed = 0;
    const results: Array<{
      paymentId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const request of refundRequests) {
      try {
        await this.refund(request, currentUser);
        results.push({ paymentId: request.paymentId, success: true });
        success++;
      } catch (error) {
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

  /**
   * 获取支付趋势分析
   */
  async getPaymentTrends(
    startDate: Date,
    endDate: Date,
    currentUser: User,
  ): Promise<{
    dailyTrends: Array<{ date: string; amount: number; count: number }>;
    methodTrends: Array<{ method: string; amount: number; percentage: number }>;
    statusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    averageTransactionValue: number;
    totalTransactions: number;
    totalRevenue: number;
  }> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'read');

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.storeId = :storeId', { storeId: currentUser.storeId })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    // 按日期统计
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

    // 按支付方式统计
    const methodStats = await queryBuilder
      .clone()
      .select('payment.paymentMethod', 'method')
      .addSelect('SUM(payment.amount)', 'amount')
      .groupBy('payment.paymentMethod')
      .getRawMany();

    const totalMethodAmount = methodStats.reduce(
      (sum, stat) => sum + (parseFloat(stat.amount) || 0),
      0,
    );

    const methodTrends = methodStats.map((stat) => ({
      method: stat.method,
      amount: parseFloat(stat.amount) || 0,
      percentage:
        totalMethodAmount > 0
          ? Math.round(
              ((parseFloat(stat.amount) || 0) / totalMethodAmount) * 100,
            )
          : 0,
    }));

    // 按状态统计
    const statusStats = await queryBuilder
      .clone()
      .select('payment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('payment.status')
      .getRawMany();

    const totalStatusCount = statusStats.reduce(
      (sum, stat) => sum + (parseInt(stat.count) || 0),
      0,
    );

    const statusDistribution = statusStats.map((stat) => ({
      status: stat.status,
      count: parseInt(stat.count) || 0,
      percentage:
        totalStatusCount > 0
          ? Math.round(((parseInt(stat.count) || 0) / totalStatusCount) * 100)
          : 0,
    }));

    // 总体统计
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
      averageTransactionValue:
        parseFloat(overallStats.averageTransactionValue) || 0,
    };
  }

  /**
   * 处理逾期分期付款
   */
  async processOverdueInstallments(): Promise<{
    processed: number;
    notified: number;
    errors: string[];
  }> {
    const now = new Date();
    const errors: string[] = [];
    let processed = 0;
    let notified = 0;

    // 查找逾期的分期付款
    const overduePayments = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: 'scheduled' })
      .andWhere("payment.metadata->>'installmentInfo' IS NOT NULL")
      .andWhere(
        "(payment.metadata->'installmentInfo'->>'dueDate')::timestamp < :now",
        { now },
      )
      .getMany();

    for (const payment of overduePayments) {
      try {
        // 标记为逾期
        payment.status = 'failed';
        payment.metadata = {
          ...payment.metadata,
          overdueInfo: {
            overdueDate: now,
            daysPastDue: Math.ceil(
              (now.getTime() -
                new Date(
                  payment.metadata?.installmentInfo?.dueDate || now,
                ).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          },
        };

        await this.paymentRepository.save(payment);
        processed++;

        // 发送逾期通知（这里应该调用通知服务）
        // await this.notificationService.sendOverdueNotification(payment);
        notified++;
      } catch (error) {
        errors.push(`处理逾期付款 ${payment.id} 失败: ${error.message}`);
      }
    }

    return { processed, notified, errors };
  }

  /**
   * 获取支付风险分析
   */
  async getRiskAnalysis(currentUser: User): Promise<{
    highRiskTransactions: number;
    suspiciousPatterns: Array<{
      type: string;
      count: number;
      description: string;
    }>;
    chargebackRate: number;
    fraudScore: number;
  }> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'payment', 'read');

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.storeId = :storeId', { storeId: currentUser.storeId })
      .andWhere('payment.createdAt >= :startDate', { startDate: last30Days });

    // 高风险交易（大额现金支付）
    const highRiskTransactions = await queryBuilder
      .clone()
      .andWhere('payment.paymentMethod = :method', { method: 'cash' })
      .andWhere('payment.amount > :amount', { amount: 1000 })
      .getCount();

    // 可疑模式检测
    const suspiciousPatterns: Array<{
      type: string;
      count: number;
      description: string;
    }> = [];

    // 频繁退款
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

    // 大额现金交易
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

    // 计算退单率
    const totalTransactions = await queryBuilder.clone().getCount();
    const chargebackRate =
      totalTransactions > 0
        ? Math.round((frequentRefunds / totalTransactions) * 100)
        : 0;

    // 简单的风险评分（0-100）
    let fraudScore = 0;
    fraudScore += Math.min(chargebackRate * 2, 40); // 退单率影响
    fraudScore += Math.min(highRiskTransactions, 30); // 高风险交易影响
    fraudScore += Math.min(suspiciousPatterns.length * 10, 30); // 可疑模式影响

    return {
      highRiskTransactions,
      suspiciousPatterns,
      chargebackRate,
      fraudScore: Math.min(fraudScore, 100),
    };
  }

  /**
   * 验证优惠券（模拟实现）
   */
  private async validateCoupon(
    couponCode: string,
    orderAmount: number,
  ): Promise<{ amount: number; type: 'fixed' | 'percentage' } | null> {
    // 模拟优惠券数据
    const coupons = {
      SAVE10: { amount: 10, type: 'fixed' as const },
      DISCOUNT20: { amount: 20, type: 'percentage' as const },
      WELCOME50: { amount: 50, type: 'fixed' as const },
    };

    const coupon = coupons[couponCode];
    if (!coupon) return null;

    if (coupon.type === 'percentage') {
      return {
        amount: Math.round((orderAmount * coupon.amount) / 100),
        type: coupon.type,
      };
    }

    return coupon;
  }
}

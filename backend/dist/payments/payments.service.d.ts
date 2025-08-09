import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
export interface CreatePaymentDto {
    orderId: string;
    amount: number;
    paymentMethod: 'wechat' | 'alipay' | 'cash' | 'card' | 'transfer';
    description?: string;
    metadata?: Record<string, any>;
}
export interface RefundDto {
    paymentId: string;
    amount?: number;
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
export declare class PaymentsService {
    private paymentRepository;
    private orderRepository;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>);
    create(createPaymentDto: CreatePaymentDto, currentUser: User): Promise<Payment>;
    findAll(queryDto: QueryPaymentDto, currentUser: User): Promise<{
        items: Payment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, currentUser: User): Promise<Payment>;
    confirmPayment(id: string, currentUser: User): Promise<Payment>;
    cancelPayment(id: string, reason: string, currentUser: User): Promise<Payment>;
    refund(refundDto: RefundDto, currentUser: User): Promise<Payment>;
    getStats(currentUser: User): Promise<{
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
        refunded: number;
        totalRevenue: number;
        completedRevenue: number;
        refundedAmount: number;
    }>;
    private generatePaymentNumber;
    private processPayment;
    private generateThirdPartyId;
    createInstallmentPayment(orderId: string, installmentPlan: {
        totalAmount: number;
        installments: number;
        firstPaymentAmount?: number;
    }, currentUser: User): Promise<Payment[]>;
    applyCoupon(paymentId: string, couponCode: string, currentUser: User): Promise<Payment>;
    batchRefund(refundRequests: Array<{
        paymentId: string;
        amount?: number;
        reason: string;
    }>, currentUser: User): Promise<{
        success: number;
        failed: number;
        results: Array<{
            paymentId: string;
            success: boolean;
            error?: string;
        }>;
    }>;
    getPaymentTrends(startDate: Date, endDate: Date, currentUser: User): Promise<{
        dailyTrends: Array<{
            date: string;
            amount: number;
            count: number;
        }>;
        methodTrends: Array<{
            method: string;
            amount: number;
            percentage: number;
        }>;
        statusDistribution: Array<{
            status: string;
            count: number;
            percentage: number;
        }>;
        averageTransactionValue: number;
        totalTransactions: number;
        totalRevenue: number;
    }>;
    processOverdueInstallments(): Promise<{
        processed: number;
        notified: number;
        errors: string[];
    }>;
    getRiskAnalysis(currentUser: User): Promise<{
        highRiskTransactions: number;
        suspiciousPatterns: Array<{
            type: string;
            count: number;
            description: string;
        }>;
        chargebackRate: number;
        fraudScore: number;
    }>;
    private validateCoupon;
}

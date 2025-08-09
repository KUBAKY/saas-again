import { PaymentsService } from './payments.service';
import type { CreatePaymentDto, RefundDto, QueryPaymentDto } from './payments.service';
import { User } from '../entities/user.entity';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(createPaymentDto: CreatePaymentDto, user: User): Promise<import("../entities/payment.entity").Payment>;
    findAll(queryDto: QueryPaymentDto, user: User): Promise<{
        items: import("../entities/payment.entity").Payment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(user: User): Promise<{
        total: number;
        completed: number;
        pending: number;
        cancelled: number;
        refunded: number;
        totalRevenue: number;
        completedRevenue: number;
        refundedAmount: number;
    }>;
    findOne(id: string, user: User): Promise<import("../entities/payment.entity").Payment>;
    confirmPayment(id: string, user: User): Promise<import("../entities/payment.entity").Payment>;
    cancelPayment(id: string, reason: string, user: User): Promise<import("../entities/payment.entity").Payment>;
    refund(refundDto: RefundDto, user: User): Promise<import("../entities/payment.entity").Payment>;
    createInstallmentPayment(installmentData: {
        orderId: string;
        installmentPlan: {
            totalAmount: number;
            installments: number;
            firstPaymentAmount?: number;
        };
    }, user: User): Promise<import("../entities/payment.entity").Payment[]>;
    getPaymentTrends(startDate: string, endDate: string, user: User): Promise<{
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
}

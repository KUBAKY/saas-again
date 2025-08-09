import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
export declare class Payment extends BaseEntity {
    paymentNumber: string;
    amount: number;
    paymentMethod: 'wechat' | 'alipay' | 'cash' | 'card' | 'transfer';
    status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    description?: string;
    thirdPartyTransactionId?: string;
    paidAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    refundAmount: number;
    refundReason?: string;
    refundedAt?: Date;
    metadata?: Record<string, any>;
    orderId: string;
    storeId: string;
    order: Order;
    isCompleted(): boolean;
    canRefund(): boolean;
    getRemainingRefundAmount(): number;
    isFullyRefunded(): boolean;
}

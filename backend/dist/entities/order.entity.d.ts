import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { Payment } from './payment.entity';
export declare class Order extends BaseEntity {
    orderNumber: string;
    type: 'membership_card' | 'course' | 'personal_training' | 'product';
    status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired';
    totalAmount: number;
    discountAmount: number;
    paidAmount: number;
    description?: string;
    paidAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    expiresAt?: Date;
    orderDetails?: {
        items: {
            id: string;
            name: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        membershipCardType?: string;
        courseId?: string;
        coachId?: string;
        sessionCount?: number;
        validityDays?: number;
    };
    metadata?: Record<string, any>;
    memberId: string;
    storeId: string;
    brandId: string;
    member: Member;
    payments: Payment[];
    isPaid(): boolean;
    isCancelled(): boolean;
    isExpired(): boolean;
    canCancel(): boolean;
    canRefund(): boolean;
    getTotalPaidAmount(): number;
    getRemainingAmount(): number;
    isFullyPaid(): boolean;
}

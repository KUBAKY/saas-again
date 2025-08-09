export declare class CreateMembershipCardDto {
    cardNumber: string;
    type: string;
    billingType: 'times' | 'period' | 'unlimited';
    price: number;
    totalSessions?: number;
    validityDays?: number;
    issueDate: string;
    expiryDate?: string;
    activationDate?: string;
    status?: 'active' | 'inactive' | 'expired' | 'frozen' | 'refunded';
    notes?: string;
    settings?: Record<string, any>;
    memberId: string;
}

export declare class CreateBookingDto {
    startTime: Date;
    endTime: Date;
    cost?: number;
    paymentMethod?: 'membership_card' | 'cash' | 'online_payment';
    notes?: string;
    memberId: string;
    coachId?: string;
    courseId: string;
    storeId: string;
}

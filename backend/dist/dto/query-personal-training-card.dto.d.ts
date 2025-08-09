export declare class QueryPersonalTrainingCardDto {
    page?: number;
    limit?: number;
    memberId?: string;
    membershipCardId?: string;
    coachId?: string;
    type?: string;
    status?: 'inactive' | 'active' | 'frozen' | 'expired';
    purchaseDateStart?: string;
    purchaseDateEnd?: string;
    search?: string;
}

export declare class QueryGroupClassCardDto {
    page?: number;
    limit?: number;
    memberId?: string;
    membershipCardId?: string;
    type?: string;
    status?: 'inactive' | 'active' | 'frozen' | 'expired';
    purchaseDateStart?: string;
    purchaseDateEnd?: string;
    search?: string;
}

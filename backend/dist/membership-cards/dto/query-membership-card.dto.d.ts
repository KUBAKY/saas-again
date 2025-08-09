export declare class QueryMembershipCardDto {
    page?: number;
    limit?: number;
    memberId?: string;
    cardType?: string;
    status?: 'active' | 'inactive' | 'expired' | 'frozen' | 'refunded';
    storeId?: string;
}

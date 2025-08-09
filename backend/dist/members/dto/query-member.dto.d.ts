export declare class QueryMemberDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'suspended';
    storeId?: string;
    level?: 'bronze' | 'silver' | 'gold' | 'platinum';
    gender?: 'male' | 'female';
    minAge?: number;
    maxAge?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

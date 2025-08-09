export declare class QueryStoreDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    brandId?: string;
    city?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

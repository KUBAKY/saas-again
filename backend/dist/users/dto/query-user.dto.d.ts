export declare class QueryUserDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    brandId?: string;
    storeId?: string;
    roleName?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

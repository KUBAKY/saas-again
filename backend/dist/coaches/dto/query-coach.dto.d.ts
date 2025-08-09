export declare class QueryCoachDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'on_leave';
    storeId?: string;
    gender?: 'male' | 'female';
    specialty?: string;
    minExperience?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

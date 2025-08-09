export declare class QueryBookingDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    memberId?: string;
    coachId?: string;
    courseId?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

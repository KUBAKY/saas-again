export declare class QueryCourseScheduleDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
    courseId?: string;
    coachId?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

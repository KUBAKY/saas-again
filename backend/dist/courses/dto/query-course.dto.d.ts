export declare class QueryCourseDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'personal' | 'group' | 'workshop';
    level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
    storeId?: string;
    coachId?: string;
    status?: 'active' | 'inactive' | 'suspended';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

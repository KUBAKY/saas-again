export declare class CreateCourseDto {
    name: string;
    description?: string;
    type: 'personal' | 'group' | 'workshop';
    level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
    duration: number;
    maxParticipants: number;
    price: number;
    coverImage?: string;
    tags?: string[];
    equipment?: string[];
    requirements?: string;
    caloriesBurn?: number;
    storeId: string;
    coachId?: string;
    settings?: Record<string, any>;
}

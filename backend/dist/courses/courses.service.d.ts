import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto';
export declare class CoursesService {
    private readonly courseRepository;
    constructor(courseRepository: Repository<Course>);
    create(createCourseDto: CreateCourseDto, user: User): Promise<Course>;
    findAll(queryDto: QueryCourseDto, user: User): Promise<{
        data: Course[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: User): Promise<Course>;
    update(id: string, updateCourseDto: UpdateCourseDto, user: User): Promise<Course>;
    updateStatus(id: string, status: 'active' | 'inactive' | 'suspended', user: User): Promise<Course>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    getStats(user: User): Promise<{
        total: number;
        active: number;
        inactive: number;
        byType: {
            personal: number;
            group: number;
            workshop: number;
        };
        averageRating: number;
    }>;
    getPopularCourses(limit: number, user: User): Promise<Course[]>;
    getCourseBookings(id: string, query: any, user: User): Promise<{
        data: import("../entities").Booking[];
        meta: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    private createBaseQuery;
}

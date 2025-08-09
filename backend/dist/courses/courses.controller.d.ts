import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto';
import { User } from '../entities/user.entity';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(createCourseDto: CreateCourseDto, user: User): Promise<import("../entities").Course>;
    findAll(queryDto: QueryCourseDto, user: User): Promise<{
        data: import("../entities").Course[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
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
    getPopularCourses(limit: string, user: User): Promise<import("../entities").Course[]>;
    findOne(id: string, user: User): Promise<import("../entities").Course>;
    getCourseBookings(id: string, query: any, user: User): Promise<{
        data: import("../entities").Booking[];
        meta: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto, user: User): Promise<import("../entities").Course>;
    updateStatus(id: string, status: 'active' | 'inactive' | 'suspended', user: User): Promise<import("../entities").Course>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}

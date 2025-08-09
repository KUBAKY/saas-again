import { CourseSchedulesService } from './course-schedules.service';
import { CreateCourseScheduleDto, UpdateCourseScheduleDto, QueryCourseScheduleDto } from './dto';
import { User } from '../entities/user.entity';
export declare class CourseSchedulesController {
    private readonly courseSchedulesService;
    constructor(courseSchedulesService: CourseSchedulesService);
    create(createDto: CreateCourseScheduleDto, user: User): Promise<import("../entities").CourseSchedule>;
    findAll(queryDto: QueryCourseScheduleDto, user: User): Promise<{
        data: import("../entities").CourseSchedule[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(user: User): Promise<{
        total: number;
        scheduled: number;
        completed: number;
        cancelled: number;
        today: number;
    }>;
    getCalendarSchedules(query: any, user: User): Promise<{
        id: string;
        title: string;
        start: Date;
        end: Date;
        status: "scheduled" | "ongoing" | "completed" | "cancelled";
        coach: string;
        store: string;
        participants: string;
        color: string;
    }[]>;
    findOne(id: string, user: User): Promise<import("../entities").CourseSchedule>;
    update(id: string, updateDto: UpdateCourseScheduleDto, user: User): Promise<import("../entities").CourseSchedule>;
    cancel(id: string, user: User, body: {
        reason?: string;
    }): Promise<import("../entities").CourseSchedule>;
    complete(id: string, user: User): Promise<import("../entities").CourseSchedule>;
    remove(id: string, user: User): Promise<void>;
}

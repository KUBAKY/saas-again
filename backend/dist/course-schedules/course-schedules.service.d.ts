import { Repository } from 'typeorm';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { Course } from '../entities/course.entity';
import { Coach } from '../entities/coach.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateCourseScheduleDto, UpdateCourseScheduleDto, QueryCourseScheduleDto } from './dto';
export declare class CourseSchedulesService {
    private readonly courseScheduleRepository;
    private readonly courseRepository;
    private readonly coachRepository;
    private readonly storeRepository;
    constructor(courseScheduleRepository: Repository<CourseSchedule>, courseRepository: Repository<Course>, coachRepository: Repository<Coach>, storeRepository: Repository<Store>);
    create(createDto: CreateCourseScheduleDto, user: User): Promise<CourseSchedule>;
    findAll(queryDto: QueryCourseScheduleDto, user: User): Promise<{
        data: CourseSchedule[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, user: User): Promise<CourseSchedule>;
    update(id: string, updateDto: UpdateCourseScheduleDto, user: User): Promise<CourseSchedule>;
    cancel(id: string, reason: string, user: User): Promise<CourseSchedule>;
    complete(id: string, user: User): Promise<CourseSchedule>;
    remove(id: string, user: User): Promise<void>;
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
    private checkTimeConflict;
    private createBaseQuery;
    private getStatusColor;
}

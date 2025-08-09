import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly courseScheduleRepository;
    constructor(bookingRepository: Repository<Booking>, courseScheduleRepository: Repository<CourseSchedule>);
    create(createBookingDto: CreateBookingDto, user: User): Promise<Booking>;
    findAll(queryDto: QueryBookingDto, user: User): Promise<{
        data: Booking[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: User): Promise<Booking>;
    update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<Booking>;
    updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show', reason?: string, user?: User): Promise<Booking>;
    confirm(id: string, user: User): Promise<Booking>;
    cancel(id: string, reason?: string, user?: User): Promise<Booking>;
    complete(id: string, user: User): Promise<Booking>;
    addReview(id: string, rating: number, review?: string, user?: User): Promise<Booking>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    getStats(user: User): Promise<{
        total: number;
        byStatus: {
            pending: number;
            confirmed: number;
            cancelled: number;
            completed: number;
            noShow: number;
        };
        todayBookings: number;
    }>;
    getCalendarBookings(query: any, user: User): Promise<{
        id: string;
        title: string;
        start: Date;
        end: Date;
        status: "pending" | "completed" | "cancelled" | "confirmed" | "charged" | "checked_in" | "no_show";
        member: string;
        coach: string | undefined;
        course: string;
        color: string;
    }[]>;
    checkConflicts(query: any, user: User): Promise<{
        hasConflicts: boolean;
        coachConflicts: Booking[];
        memberConflicts: Booking[];
    }>;
    private createBaseQuery;
    private generateBookingNumber;
    private validateBookingTime;
    private checkUpdatePermission;
    private validateStatusTransition;
    private getStatusColor;
    processAutoCharging(): Promise<{
        processed: number;
        failed: number;
    }>;
    checkIn(bookingId: string, user: User): Promise<Booking>;
    markCompleted(bookingId: string, user: User): Promise<Booking>;
    markNoShow(bookingId: string, user: User): Promise<Booking>;
    createGroupClassBooking(scheduleId: string, memberId: string, user: User): Promise<Booking>;
    cancelGroupClassBooking(bookingId: string, reason?: string, user?: User): Promise<Booking>;
    getMemberBookings(memberId: string, queryDto: QueryBookingDto, user: User): Promise<{
        isGroupClass: boolean;
        isPersonalTraining: boolean;
        canCancel: boolean;
        canCheckIn: boolean;
        bookingNumber: string;
        startTime: Date;
        endTime: Date;
        status: "pending" | "confirmed" | "charged" | "checked_in" | "completed" | "cancelled" | "no_show";
        cost?: number;
        paymentMethod?: "membership_card" | "cash" | "online_payment";
        cancelledAt?: Date;
        cancellationReason?: string;
        notes?: string;
        rating?: number;
        review?: string;
        reviewedAt?: Date;
        chargedAt?: Date;
        checkedInAt?: Date;
        memberId: string;
        coachId?: string;
        courseId: string;
        storeId: string;
        courseScheduleId?: string;
        member: import("../entities").Member;
        coach?: import("../entities").Coach;
        course: import("../entities").Course;
        store: import("../entities").Store;
        courseSchedule?: CourseSchedule;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
        createdBy?: string;
        updatedBy?: string;
        version: number;
    }[]>;
}

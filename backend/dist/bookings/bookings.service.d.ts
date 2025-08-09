import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { User } from '../entities/user.entity';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { Course } from '../entities/course.entity';
import { Member } from '../entities/member.entity';
import { Coach } from '../entities/coach.entity';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';
export declare class BookingsService {
    private readonly bookingRepository;
    private readonly courseScheduleRepository;
    private readonly courseRepository;
    private readonly memberRepository;
    private readonly coachRepository;
    constructor(bookingRepository: Repository<Booking>, courseScheduleRepository: Repository<CourseSchedule>, courseRepository: Repository<Course>, memberRepository: Repository<Member>, coachRepository: Repository<Coach>);
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
        conflictTypes: string[];
        coachConflicts: Booking[];
        memberConflicts: Booking[];
        capacityConflicts: Booking[];
        details: {
            coachConflictCount: number;
            memberConflictCount: number;
            capacityConflictCount: number;
        };
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
        member: Member;
        coach?: Coach;
        course: Course;
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
    rescheduleBooking(bookingId: string, newStartTime: Date, newEndTime: Date, reason?: string, user?: User): Promise<Booking>;
    getBookingsForReminder(reminderType: 'before_24h' | 'before_2h' | 'before_30min', user: User): Promise<Booking[]>;
    getBookingAnalytics(startDate: Date, endDate: Date, user: User): Promise<{
        totalBookings: number;
        completionRate: number;
        cancellationRate: number;
        noShowRate: number;
        popularTimeSlots: Array<{
            hour: number;
            count: number;
        }>;
        popularCourses: Array<{
            courseId: string;
            courseName: string;
            count: number;
        }>;
        coachPerformance: Array<{
            coachId: string;
            coachName: string;
            bookings: number;
            completionRate: number;
        }>;
        memberActivity: Array<{
            memberId: string;
            memberName: string;
            bookings: number;
        }>;
    }>;
    batchUpdateBookings(bookingIds: string[], operation: 'confirm' | 'cancel' | 'complete', reason?: string, user?: User): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    getConflictDetails(startTime: Date, endTime: Date, coachId?: string, memberId?: string, courseId?: string, storeId?: string, user?: User): Promise<{
        hasConflicts: boolean;
        conflicts: Array<{
            type: 'coach' | 'member' | 'capacity';
            booking: Booking;
            message: string;
        }>;
    }>;
    processExpiredBookings(): Promise<{
        processed: number;
        errors: string[];
    }>;
}

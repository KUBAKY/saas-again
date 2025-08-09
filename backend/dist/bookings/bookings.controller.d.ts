import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, QueryBookingDto } from './dto';
import { User } from '../entities/user.entity';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, user: User): Promise<import("../entities").Booking>;
    findAll(queryDto: QueryBookingDto, user: User): Promise<{
        data: import("../entities").Booking[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
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
        status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show" | "charged" | "checked_in";
        member: string;
        coach: string | undefined;
        course: string;
        color: string;
    }[]>;
    checkConflicts(query: any, user: User): Promise<{
        hasConflicts: boolean;
        conflictTypes: string[];
        coachConflicts: import("../entities").Booking[];
        memberConflicts: import("../entities").Booking[];
        capacityConflicts: import("../entities").Booking[];
        details: {
            coachConflictCount: number;
            memberConflictCount: number;
            capacityConflictCount: number;
        };
    }>;
    findOne(id: string, user: User): Promise<import("../entities").Booking>;
    update(id: string, updateBookingDto: UpdateBookingDto, user: User): Promise<import("../entities").Booking>;
    updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show', user: User, reason?: string): Promise<import("../entities").Booking>;
    confirm(id: string, user: User): Promise<import("../entities").Booking>;
    cancel(id: string, user: User, reason?: string): Promise<import("../entities").Booking>;
    complete(id: string, user: User): Promise<import("../entities").Booking>;
    addReview(id: string, rating: number, user: User, review?: string): Promise<import("../entities").Booking>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    processAutoCharging(user: User): Promise<{
        processed: number;
        failed: number;
    }>;
    checkIn(id: string, user: User): Promise<import("../entities").Booking>;
    markCompleted(id: string, user: User): Promise<import("../entities").Booking>;
    markNoShow(id: string, user: User): Promise<import("../entities").Booking>;
    createGroupClassBooking(scheduleId: string, memberId: string, user: User): Promise<import("../entities").Booking>;
    cancelGroupClassBooking(id: string, user: User, reason?: string): Promise<import("../entities").Booking>;
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
        courseSchedule?: import("../entities").CourseSchedule;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date;
        createdBy?: string;
        updatedBy?: string;
        version: number;
    }[]>;
}

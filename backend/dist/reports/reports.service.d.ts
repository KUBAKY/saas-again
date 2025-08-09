import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { Booking } from '../entities/booking.entity';
import { Payment } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
export interface ReportQueryDto {
    startDate: Date;
    endDate: Date;
    storeId?: string;
    type?: string;
}
export interface MemberReportDto {
    totalMembers: number;
    newMembers: number;
    activeMembers: number;
    memberGrowthRate: number;
    membersByType: Array<{
        type: string;
        count: number;
    }>;
    membersByAge: Array<{
        ageGroup: string;
        count: number;
    }>;
    membersByGender: Array<{
        gender: string;
        count: number;
    }>;
}
export interface BookingReportDto {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    bookingCompletionRate: number;
    bookingsByDate: Array<{
        date: string;
        count: number;
    }>;
    popularCourses: Array<{
        courseName: string;
        bookingCount: number;
    }>;
    peakHours: Array<{
        hour: number;
        count: number;
    }>;
}
export interface RevenueReportDto {
    totalRevenue: number;
    membershipRevenue: number;
    courseRevenue: number;
    otherRevenue: number;
    revenueByDate: Array<{
        date: string;
        amount: number;
    }>;
    revenueByPaymentMethod: Array<{
        method: string;
        amount: number;
    }>;
    averageOrderValue: number;
}
export interface CoachReportDto {
    totalCoaches: number;
    activeCoaches: number;
    coachUtilization: Array<{
        coachId: string;
        coachName: string;
        totalHours: number;
        bookedHours: number;
        utilizationRate: number;
    }>;
    coachRatings: Array<{
        coachId: string;
        coachName: string;
        averageRating: number;
        totalRatings: number;
    }>;
}
export declare class ReportsService {
    private memberRepository;
    private bookingRepository;
    private paymentRepository;
    private orderRepository;
    private membershipCardRepository;
    private courseRepository;
    private userRepository;
    constructor(memberRepository: Repository<Member>, bookingRepository: Repository<Booking>, paymentRepository: Repository<Payment>, orderRepository: Repository<Order>, membershipCardRepository: Repository<MembershipCard>, courseRepository: Repository<Course>, userRepository: Repository<User>);
    getMemberReport(queryDto: ReportQueryDto, currentUser: User): Promise<MemberReportDto>;
    getBookingReport(queryDto: ReportQueryDto, currentUser: User): Promise<BookingReportDto>;
    getRevenueReport(queryDto: ReportQueryDto, currentUser: User): Promise<RevenueReportDto>;
    getCoachReport(queryDto: ReportQueryDto, currentUser: User): Promise<CoachReportDto>;
    getDashboardData(queryDto: ReportQueryDto, currentUser: User): Promise<{
        member: MemberReportDto;
        booking: BookingReportDto;
        revenue: RevenueReportDto;
        coach: CoachReportDto;
        summary: {
            totalMembers: number;
            totalBookings: number;
            totalRevenue: number;
            totalCoaches: number;
        };
    }>;
    exportReport(type: 'member' | 'booking' | 'revenue' | 'coach', queryDto: ReportQueryDto, currentUser: User): Promise<{
        type: "member" | "coach" | "booking" | "revenue";
        data: any;
        exportTime: Date;
        filename: string;
    }>;
}

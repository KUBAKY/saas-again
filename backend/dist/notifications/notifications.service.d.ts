import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
export interface CreateNotificationDto {
    title: string;
    content: string;
    type: 'system' | 'booking' | 'payment' | 'membership' | 'promotion';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    targetType: 'all' | 'member' | 'coach' | 'staff';
    targetIds?: string[];
    scheduledAt?: Date;
    channels: ('push' | 'sms' | 'email' | 'wechat')[];
    metadata?: Record<string, any>;
}
export interface QueryNotificationDto {
    page?: number;
    limit?: number;
    type?: string;
    priority?: string;
    status?: string;
    targetType?: string;
    startDate?: Date;
    endDate?: Date;
}
export interface SendSmsDto {
    phone: string;
    template: string;
    params?: Record<string, string>;
}
export interface SendEmailDto {
    email: string;
    subject: string;
    content: string;
    template?: string;
    params?: Record<string, any>;
}
export interface SendPushDto {
    userId: string;
    title: string;
    content: string;
    data?: Record<string, any>;
}
export declare class NotificationsService {
    private notificationRepository;
    private userRepository;
    private memberRepository;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>, memberRepository: Repository<Member>);
    create(createNotificationDto: CreateNotificationDto, currentUser: User): Promise<Notification>;
    findAll(queryDto: QueryNotificationDto, currentUser: User): Promise<{
        items: Notification[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, currentUser: User): Promise<Notification>;
    sendSms(sendSmsDto: SendSmsDto, currentUser: User): Promise<boolean>;
    sendEmail(sendEmailDto: SendEmailDto, currentUser: User): Promise<boolean>;
    sendPush(sendPushDto: SendPushDto, currentUser: User): Promise<boolean>;
    sendWechatMessage(openId: string, templateId: string, data: Record<string, any>, currentUser: User): Promise<boolean>;
    batchSend(notificationIds: string[], currentUser: User): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    cancel(id: string, currentUser: User): Promise<Notification>;
    getStats(currentUser: User): Promise<{
        total: number;
        sent: number;
        pending: number;
        scheduled: number;
        failed: number;
        cancelled: number;
    }>;
    private processNotification;
    private getNotificationTargets;
    private generateNotificationNumber;
    getTypeStats(currentUser: User): Promise<{
        type: any;
        count: number;
        sentCount: number;
    }[]>;
}

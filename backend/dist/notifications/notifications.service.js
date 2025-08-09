"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entities/notification.entity");
const user_entity_1 = require("../entities/user.entity");
const member_entity_1 = require("../entities/member.entity");
const permission_util_1 = require("../common/utils/permission.util");
let NotificationsService = class NotificationsService {
    notificationRepository;
    userRepository;
    memberRepository;
    constructor(notificationRepository, userRepository, memberRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
    }
    async create(createNotificationDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'create');
        const notificationNumber = this.generateNotificationNumber();
        const notification = this.notificationRepository.create({
            ...createNotificationDto,
            notificationNumber,
            status: createNotificationDto.scheduledAt ? 'scheduled' : 'pending',
            storeId: currentUser.storeId,
            createdBy: currentUser.id,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        if (!createNotificationDto.scheduledAt) {
            await this.processNotification(savedNotification, currentUser);
        }
        return savedNotification;
    }
    async findAll(queryDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'read');
        const { page = 1, limit = 20, type, priority, status, targetType, startDate, endDate, } = queryDto;
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.storeId = :storeId', {
            storeId: currentUser.storeId,
        });
        if (currentUser.storeId) {
            queryBuilder.andWhere('notification.storeId = :storeId', {
                storeId: currentUser.storeId,
            });
        }
        if (type) {
            queryBuilder.andWhere('notification.type = :type', { type });
        }
        if (priority) {
            queryBuilder.andWhere('notification.priority = :priority', { priority });
        }
        if (status) {
            queryBuilder.andWhere('notification.status = :status', { status });
        }
        if (targetType) {
            queryBuilder.andWhere('notification.targetType = :targetType', {
                targetType,
            });
        }
        if (startDate) {
            queryBuilder.andWhere('notification.createdAt >= :startDate', {
                startDate,
            });
        }
        if (endDate) {
            queryBuilder.andWhere('notification.createdAt <= :endDate', { endDate });
        }
        const [items, total] = await queryBuilder
            .orderBy('notification.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'read');
        const notification = await this.notificationRepository.findOne({
            where: {
                id,
                storeId: currentUser.storeId,
            },
        });
        if (!notification) {
            throw new common_1.NotFoundException('通知不存在');
        }
        return notification;
    }
    async sendSms(sendSmsDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'create');
        try {
            console.log('发送短信:', {
                phone: sendSmsDto.phone,
                template: sendSmsDto.template,
                params: sendSmsDto.params,
            });
            return true;
        }
        catch (error) {
            console.error('短信发送失败:', error);
            return false;
        }
    }
    async sendEmail(sendEmailDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'create');
        try {
            console.log('发送邮件:', {
                email: sendEmailDto.email,
                subject: sendEmailDto.subject,
                content: sendEmailDto.content,
            });
            return true;
        }
        catch (error) {
            console.error('邮件发送失败:', error);
            return false;
        }
    }
    async sendPush(sendPushDto, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'create');
        try {
            console.log('发送推送:', {
                userId: sendPushDto.userId,
                title: sendPushDto.title,
                content: sendPushDto.content,
                data: sendPushDto.data,
            });
            return true;
        }
        catch (error) {
            console.error('推送发送失败:', error);
            return false;
        }
    }
    async sendWechatMessage(openId, templateId, data, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'create');
        try {
            console.log('发送微信消息:', {
                openId,
                templateId,
                data,
            });
            return true;
        }
        catch (error) {
            console.error('微信消息发送失败:', error);
            return false;
        }
    }
    async batchSend(notificationIds, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'update');
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const id of notificationIds) {
            try {
                const notification = await this.findOne(id, currentUser);
                await this.processNotification(notification, currentUser);
                success++;
            }
            catch (error) {
                failed++;
                errors.push(`通知 ${id}: ${error.message}`);
            }
        }
        return { success, failed, errors };
    }
    async cancel(id, currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'update');
        const notification = await this.findOne(id, currentUser);
        if (notification.status === 'sent') {
            throw new common_1.BadRequestException('已发送的通知无法取消');
        }
        notification.status = 'cancelled';
        notification.updatedBy = currentUser.id;
        return await this.notificationRepository.save(notification);
    }
    async getStats(currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'read');
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.storeId = :storeId', {
            storeId: currentUser.storeId,
        });
        const [total, sent, pending, scheduled, failed, cancelled] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder
                .clone()
                .andWhere('notification.status = :status', { status: 'sent' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('notification.status = :status', { status: 'pending' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('notification.status = :status', { status: 'scheduled' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('notification.status = :status', { status: 'failed' })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('notification.status = :status', { status: 'cancelled' })
                .getCount(),
        ]);
        return {
            total,
            sent,
            pending,
            scheduled,
            failed,
            cancelled,
        };
    }
    async processNotification(notification, currentUser) {
        try {
            notification.status = 'sending';
            await this.notificationRepository.save(notification);
            const targets = await this.getNotificationTargets(notification, currentUser);
            let successCount = 0;
            let failedCount = 0;
            for (const target of targets) {
                for (const channel of notification.channels) {
                    try {
                        let sent = false;
                        switch (channel) {
                            case 'sms':
                                if (target.phone) {
                                    sent = await this.sendSms({
                                        phone: target.phone,
                                        template: 'default',
                                        params: { content: notification.content },
                                    }, currentUser);
                                }
                                break;
                            case 'email':
                                if (target.email) {
                                    sent = await this.sendEmail({
                                        email: target.email,
                                        subject: notification.title,
                                        content: notification.content,
                                    }, currentUser);
                                }
                                break;
                            case 'push':
                                sent = await this.sendPush({
                                    userId: target.id,
                                    title: notification.title,
                                    content: notification.content,
                                }, currentUser);
                                break;
                            case 'wechat':
                                if (target.wechatOpenId) {
                                    sent = await this.sendWechatMessage(target.wechatOpenId, 'default_template', {
                                        title: notification.title,
                                        content: notification.content,
                                    }, currentUser);
                                }
                                break;
                        }
                        if (sent) {
                            successCount++;
                        }
                        else {
                            failedCount++;
                        }
                    }
                    catch (error) {
                        failedCount++;
                        console.error(`发送通知失败 (${channel}):`, error);
                    }
                }
            }
            notification.status = failedCount === 0 ? 'sent' : 'failed';
            notification.sentAt = new Date();
            notification.sentCount = successCount;
            notification.failedCount = failedCount;
            notification.updatedBy = currentUser.id;
            await this.notificationRepository.save(notification);
        }
        catch (error) {
            notification.status = 'failed';
            notification.updatedBy = currentUser.id;
            await this.notificationRepository.save(notification);
            throw error;
        }
    }
    async getNotificationTargets(notification, currentUser) {
        const targets = [];
        if (notification.targetIds && notification.targetIds.length > 0) {
            if (notification.targetType === 'member') {
                const members = await this.memberRepository.find({
                    where: {
                        id: notification.targetIds[0],
                        storeId: currentUser.storeId,
                    },
                });
                targets.push(...members.map((member) => ({
                    id: member.id,
                    phone: member.phone,
                    email: member.email,
                    wechatOpenId: member.wechatOpenId,
                })));
            }
            else {
                const users = await this.userRepository.find({
                    where: {
                        id: notification.targetIds[0],
                        storeId: currentUser.storeId,
                    },
                });
                targets.push(...users.map((user) => ({
                    id: user.id,
                    phone: user.phone,
                    email: user.email,
                    wechatOpenId: undefined,
                })));
            }
        }
        else {
            switch (notification.targetType) {
                case 'all':
                case 'member': {
                    const members = await this.memberRepository.find({
                        where: { storeId: currentUser.storeId },
                    });
                    targets.push(...members.map((member) => ({
                        id: member.id,
                        phone: member.phone,
                        email: member.email,
                        wechatOpenId: member.wechatOpenId,
                    })));
                    break;
                }
                case 'coach':
                case 'staff': {
                    const users = await this.userRepository.find({
                        where: { storeId: currentUser.storeId },
                        relations: ['roles'],
                    });
                    const filteredUsers = users.filter((user) => {
                        const roleName = user.roles?.[0]?.name;
                        return notification.targetType === 'coach'
                            ? roleName === 'coach'
                            : roleName !== 'member';
                    });
                    targets.push(...filteredUsers.map((user) => ({
                        id: user.id,
                        phone: user.phone,
                        email: user.email,
                        wechatOpenId: undefined,
                    })));
                    break;
                }
            }
        }
        return targets;
    }
    generateNotificationNumber() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NOTIF${timestamp}${random}`;
    }
    async getTypeStats(currentUser) {
        (0, permission_util_1.checkPermission)(currentUser.roles?.[0]?.name || '', 'notification', 'read');
        const stats = await this.notificationRepository
            .createQueryBuilder('notification')
            .select('notification.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .addSelect("SUM(CASE WHEN notification.status = 'sent' THEN 1 ELSE 0 END)", 'sentCount')
            .where('notification.storeId = :storeId', {
            storeId: currentUser.storeId,
        })
            .groupBy('notification.type')
            .getRawMany();
        return stats.map((stat) => ({
            type: stat.type,
            count: parseInt(stat.count),
            sentCount: parseInt(stat.sentCount),
        }));
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
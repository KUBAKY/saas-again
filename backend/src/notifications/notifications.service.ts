import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { checkPermission } from '../common/utils/permission.util';

export interface CreateNotificationDto {
  title: string;
  content: string;
  type: 'system' | 'booking' | 'payment' | 'membership' | 'promotion';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetType: 'all' | 'member' | 'coach' | 'staff';
  targetIds?: string[]; // 特定目标用户ID
  scheduledAt?: Date; // 定时发送
  channels: ('push' | 'sms' | 'email' | 'wechat')[]; // 发送渠道
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

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  /**
   * 创建通知
   */
  async create(
    createNotificationDto: CreateNotificationDto,
    currentUser: User,
  ): Promise<Notification> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'create',
    );

    // 生成通知编号
    const notificationNumber = this.generateNotificationNumber();

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      notificationNumber,
      status: createNotificationDto.scheduledAt ? 'scheduled' : 'pending',
      storeId: currentUser.storeId,
      createdBy: currentUser.id,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    // 如果不是定时发送，立即处理
    if (!createNotificationDto.scheduledAt) {
      await this.processNotification(savedNotification, currentUser);
    }

    return savedNotification;
  }

  /**
   * 查询通知列表
   */
  async findAll(queryDto: QueryNotificationDto, currentUser: User) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'notification', 'read');

    const {
      page = 1,
      limit = 20,
      type,
      priority,
      status,
      targetType,
      startDate,
      endDate,
    } = queryDto;

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

  /**
   * 获取单个通知
   */
  async findOne(id: string, currentUser: User): Promise<Notification> {
    checkPermission(currentUser.roles?.[0]?.name || '', 'notification', 'read');

    const notification = await this.notificationRepository.findOne({
      where: {
        id,
        storeId: currentUser.storeId,
      },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    return notification;
  }

  /**
   * 发送短信
   */
  async sendSms(sendSmsDto: SendSmsDto, currentUser: User): Promise<boolean> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'create',
    );

    try {
      // 这里应该集成真实的短信服务提供商 API
      // 例如：阿里云短信、腾讯云短信等
      console.log('发送短信:', {
        phone: sendSmsDto.phone,
        template: sendSmsDto.template,
        params: sendSmsDto.params,
      });

      // 模拟发送成功
      return true;
    } catch (error) {
      console.error('短信发送失败:', error);
      return false;
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(
    sendEmailDto: SendEmailDto,
    currentUser: User,
  ): Promise<boolean> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'create',
    );

    try {
      // 这里应该集成邮件服务
      // 例如：SendGrid、阿里云邮件推送等
      console.log('发送邮件:', {
        email: sendEmailDto.email,
        subject: sendEmailDto.subject,
        content: sendEmailDto.content,
      });

      // 模拟发送成功
      return true;
    } catch (error) {
      console.error('邮件发送失败:', error);
      return false;
    }
  }

  /**
   * 发送推送通知
   */
  async sendPush(
    sendPushDto: SendPushDto,
    currentUser: User,
  ): Promise<boolean> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'create',
    );

    try {
      // 这里应该集成推送服务
      // 例如：极光推送、个推等
      console.log('发送推送:', {
        userId: sendPushDto.userId,
        title: sendPushDto.title,
        content: sendPushDto.content,
        data: sendPushDto.data,
      });

      // 模拟发送成功
      return true;
    } catch (error) {
      console.error('推送发送失败:', error);
      return false;
    }
  }

  /**
   * 发送微信消息
   */
  async sendWechatMessage(
    openId: string,
    templateId: string,
    data: Record<string, any>,
    currentUser: User,
  ): Promise<boolean> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'create',
    );

    try {
      // 这里应该集成微信模板消息 API
      console.log('发送微信消息:', {
        openId,
        templateId,
        data,
      });

      // 模拟发送成功
      return true;
    } catch (error) {
      console.error('微信消息发送失败:', error);
      return false;
    }
  }

  /**
   * 批量发送通知
   */
  async batchSend(
    notificationIds: string[],
    currentUser: User,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'update',
    );

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const id of notificationIds) {
      try {
        const notification = await this.findOne(id, currentUser);
        await this.processNotification(notification, currentUser);
        success++;
      } catch (error) {
        failed++;
        errors.push(`通知 ${id}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * 取消通知
   */
  async cancel(id: string, currentUser: User): Promise<Notification> {
    checkPermission(
      currentUser.roles?.[0]?.name || '',
      'notification',
      'update',
    );

    const notification = await this.findOne(id, currentUser);

    if (notification.status === 'sent') {
      throw new BadRequestException('已发送的通知无法取消');
    }

    notification.status = 'cancelled';
    notification.updatedBy = currentUser.id;

    return await this.notificationRepository.save(notification);
  }

  /**
   * 获取通知统计
   */
  async getStats(currentUser: User) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'notification', 'read');

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.storeId = :storeId', {
        storeId: currentUser.storeId,
      });

    const [total, sent, pending, scheduled, failed, cancelled] =
      await Promise.all([
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

  /**
   * 处理通知发送
   */
  private async processNotification(
    notification: Notification,
    currentUser: User,
  ): Promise<void> {
    try {
      notification.status = 'sending';
      await this.notificationRepository.save(notification);

      // 获取目标用户列表
      const targets = await this.getNotificationTargets(
        notification,
        currentUser,
      );

      let successCount = 0;
      let failedCount = 0;

      // 按渠道发送通知
      for (const target of targets) {
        for (const channel of notification.channels) {
          try {
            let sent = false;

            switch (channel) {
              case 'sms':
                if (target.phone) {
                  sent = await this.sendSms(
                    {
                      phone: target.phone,
                      template: 'default',
                      params: { content: notification.content },
                    },
                    currentUser,
                  );
                }
                break;
              case 'email':
                if (target.email) {
                  sent = await this.sendEmail(
                    {
                      email: target.email,
                      subject: notification.title,
                      content: notification.content,
                    },
                    currentUser,
                  );
                }
                break;
              case 'push':
                sent = await this.sendPush(
                  {
                    userId: target.id,
                    title: notification.title,
                    content: notification.content,
                  },
                  currentUser,
                );
                break;
              case 'wechat':
                if (target.wechatOpenId) {
                  sent = await this.sendWechatMessage(
                    target.wechatOpenId,
                    'default_template',
                    {
                      title: notification.title,
                      content: notification.content,
                    },
                    currentUser,
                  );
                }
                break;
            }

            if (sent) {
              successCount++;
            } else {
              failedCount++;
            }
          } catch (error) {
            failedCount++;
            console.error(`发送通知失败 (${channel}):`, error);
          }
        }
      }

      // 更新通知状态
      notification.status = failedCount === 0 ? 'sent' : 'failed';
      notification.sentAt = new Date();
      notification.sentCount = successCount;
      notification.failedCount = failedCount;
      notification.updatedBy = currentUser.id;

      await this.notificationRepository.save(notification);
    } catch (error) {
      notification.status = 'failed';
      notification.updatedBy = currentUser.id;
      await this.notificationRepository.save(notification);
      throw error;
    }
  }

  /**
   * 获取通知目标用户
   */
  private async getNotificationTargets(
    notification: Notification,
    currentUser: User,
  ): Promise<
    Array<{ id: string; phone?: string; email?: string; wechatOpenId?: string }>
  > {
    const targets: Array<{
      id: string;
      phone?: string;
      email?: string;
      wechatOpenId?: string;
    }> = [];

    if (notification.targetIds && notification.targetIds.length > 0) {
      // 指定目标用户
      if (notification.targetType === 'member') {
        const members = await this.memberRepository.find({
          where: {
            id: notification.targetIds[0], // 简化处理，实际应该用 In 操作符
            storeId: currentUser.storeId,
          },
        });
        targets.push(
          ...members.map((member) => ({
            id: member.id,
            phone: member.phone,
            email: member.email,
            wechatOpenId: member.wechatOpenId,
          })),
        );
      } else {
        const users = await this.userRepository.find({
          where: {
            id: notification.targetIds[0], // 简化处理
            storeId: currentUser.storeId,
          },
        });
        targets.push(
          ...users.map((user) => ({
            id: user.id,
            phone: user.phone,
            email: user.email,
            wechatOpenId: undefined, // 用户表可能没有微信信息
          })),
        );
      }
    } else {
      // 全体用户
      switch (notification.targetType) {
        case 'all':
        case 'member': {
          const members = await this.memberRepository.find({
            where: { storeId: currentUser.storeId },
          });
          targets.push(
            ...members.map((member) => ({
              id: member.id,
              phone: member.phone,
              email: member.email,
              wechatOpenId: member.wechatOpenId,
            })),
          );
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
          targets.push(
            ...filteredUsers.map((user) => ({
              id: user.id,
              phone: user.phone,
              email: user.email,
              wechatOpenId: undefined,
            })),
          );
          break;
        }
      }
    }

    return targets;
  }

  /**
   * 生成通知编号
   */
  private generateNotificationNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `NOTIF${timestamp}${random}`;
  }

  /**
   * 获取通知类型统计
   */
  async getTypeStats(currentUser: User) {
    checkPermission(currentUser.roles?.[0]?.name || '', 'notification', 'read');

    const stats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect(
        "SUM(CASE WHEN notification.status = 'sent' THEN 1 ELSE 0 END)",
        'sentCount',
      )
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
}

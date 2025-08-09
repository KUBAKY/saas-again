import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
@Index(['storeId', 'type'])
@Index(['storeId', 'status'])
@Index(['storeId', 'targetType'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  notificationNumber: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['system', 'booking', 'payment', 'membership', 'promotion'],
  })
  type: 'system' | 'booking' | 'payment' | 'membership' | 'promotion';

  @Column({
    type: 'enum',
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  })
  priority: 'low' | 'normal' | 'high' | 'urgent';

  @Column({
    type: 'enum',
    enum: ['all', 'member', 'coach', 'staff'],
  })
  targetType: 'all' | 'member' | 'coach' | 'staff';

  @Column('simple-array', { nullable: true })
  targetIds: string[];

  @Column({
    type: 'enum',
    enum: ['pending', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
  })
  status: 'pending' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';

  @Column('simple-array')
  channels: ('push' | 'sms' | 'email' | 'wechat')[];

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'int', default: 0 })
  sentCount: number;

  @Column({ type: 'int', default: 0 })
  failedCount: number;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  storeId: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 业务方法
  isPending(): boolean {
    return this.status === 'pending';
  }

  isScheduled(): boolean {
    return this.status === 'scheduled';
  }

  isSent(): boolean {
    return this.status === 'sent';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  canCancel(): boolean {
    return ['pending', 'scheduled'].includes(this.status);
  }

  canResend(): boolean {
    return this.status === 'failed';
  }

  isExpired(): boolean {
    if (!this.scheduledAt) return false;
    return new Date() > this.scheduledAt;
  }

  getSuccessRate(): number {
    const total = this.sentCount + this.failedCount;
    if (total === 0) return 0;
    return (this.sentCount / total) * 100;
  }
}

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { Coach } from './coach.entity';
import { Course } from './course.entity';
import { Store } from './store.entity';
import { CourseSchedule } from './course-schedule.entity';

@Entity('bookings')
@Index(['memberId', 'startTime'])
@Index(['coachId', 'startTime'])
@Index(['courseId', 'startTime'])
export class Booking extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
    comment: '预约编号',
  })
  bookingNumber: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    comment: '开始时间',
  })
  startTime: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    comment: '结束时间',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: [
      'pending',
      'confirmed',
      'charged',
      'checked_in',
      'completed',
      'cancelled',
      'no_show',
    ],
    default: 'pending',
    comment: '预约状态',
  })
  status:
    | 'pending'
    | 'confirmed'
    | 'charged'
    | 'checked_in'
    | 'completed'
    | 'cancelled'
    | 'no_show';

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '费用',
  })
  cost?: number;

  @Column({
    type: 'enum',
    enum: ['membership_card', 'cash', 'online_payment'],
    nullable: true,
    comment: '支付方式',
  })
  paymentMethod?: 'membership_card' | 'cash' | 'online_payment';

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '取消时间',
  })
  cancelledAt?: Date;

  @Column({
    type: 'text',
    nullable: true,
    comment: '取消原因',
  })
  cancellationReason?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: '评分（1-5）',
  })
  rating?: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: '评价内容',
  })
  review?: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '评价时间',
  })
  reviewedAt?: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '扣费时间',
  })
  chargedAt?: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '签到时间',
  })
  checkedInAt?: Date;

  // 外键关联
  @Column({
    name: 'member_id',
    type: 'uuid',
    nullable: false,
  })
  memberId: string;

  @Column({
    name: 'coach_id',
    type: 'uuid',
    nullable: true,
  })
  coachId?: string;

  @Column({
    name: 'course_id',
    type: 'uuid',
    nullable: false,
  })
  courseId: string;

  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  @Column({
    name: 'course_schedule_id',
    type: 'uuid',
    nullable: true,
    comment: '课程排课ID（团课使用）',
  })
  courseScheduleId?: string;

  // 关联关系
  @ManyToOne(() => Member, (member) => member.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Coach, (coach) => coach.bookings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'coach_id' })
  coach?: Coach;

  @ManyToOne(() => Course, (course) => course.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Store, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => CourseSchedule, (schedule) => schedule.bookings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'course_schedule_id' })
  courseSchedule?: CourseSchedule;

  // 业务方法
  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  isCancellable(): boolean {
    if (this.status !== 'confirmed' && this.status !== 'charged') return false;

    // 开始前3小时内不能取消
    const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return new Date(this.startTime) > threeHoursFromNow;
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isPast(): boolean {
    return new Date(this.endTime) < new Date();
  }

  isCurrent(): boolean {
    const now = new Date();
    return new Date(this.startTime) <= now && new Date(this.endTime) >= now;
  }

  isUpcoming(): boolean {
    return new Date(this.startTime) > new Date();
  }

  getDuration(): number {
    const diffMs =
      new Date(this.endTime).getTime() - new Date(this.startTime).getTime();
    return Math.floor(diffMs / (1000 * 60)); // 返回分钟数
  }

  confirm(): void {
    if (this.status === 'pending') {
      this.status = 'confirmed';
    }
  }

  isCharged(): boolean {
    return (
      this.status === 'charged' ||
      this.status === 'checked_in' ||
      this.status === 'completed'
    );
  }

  isCheckedIn(): boolean {
    return this.status === 'checked_in' || this.status === 'completed';
  }

  needsCharging(): boolean {
    if (this.status !== 'confirmed') return false;

    // 课前3小时需要扣费
    const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return new Date(this.startTime) <= threeHoursFromNow;
  }

  charge(): boolean {
    if (this.status !== 'confirmed') return false;

    this.status = 'charged';
    this.chargedAt = new Date();
    return true;
  }

  checkIn(): boolean {
    if (this.status !== 'charged') return false;

    this.status = 'checked_in';
    this.checkedInAt = new Date();
    return true;
  }

  complete(): boolean {
    if (this.status !== 'checked_in') return false;

    this.status = 'completed';
    return true;
  }

  markNoShow(): boolean {
    if (this.status !== 'charged') return false;

    this.status = 'no_show';
    return true;
  }

  isGroupClass(): boolean {
    return (
      this.courseScheduleId !== null && this.courseScheduleId !== undefined
    );
  }

  isPersonalTraining(): boolean {
    return !this.isGroupClass();
  }

  cancel(reason?: string): boolean {
    if (!this.isCancellable()) return false;

    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;

    return true;
  }

  addReview(rating: number, review?: string): void {
    if (this.status === 'completed' && !this.rating) {
      this.rating = Math.max(1, Math.min(5, Math.round(rating)));
      this.review = review;
      this.reviewedAt = new Date();
    }
  }

  hasReview(): boolean {
    return !!this.rating;
  }

  getTimeUntilStart(): number {
    const now = new Date();
    const start = new Date(this.startTime);
    const diffMs = start.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60)); // 返回分钟数
  }
}

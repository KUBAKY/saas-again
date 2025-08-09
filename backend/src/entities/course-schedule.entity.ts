import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';
import { Coach } from './coach.entity';
import { Store } from './store.entity';
import { Booking } from './booking.entity';

@Entity('course_schedules')
@Index(['storeId', 'startTime'])
@Index(['courseId', 'startTime'])
@Index(['coachId', 'startTime'])
export class CourseSchedule extends BaseEntity {
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
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '上课地点/教室',
  })
  location?: string;

  @Column({
    type: 'int',
    nullable: false,
    comment: '最大参与人数',
  })
  maxParticipants: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '当前预约人数',
  })
  currentParticipants: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '本次课程价格（可覆盖课程默认价格）',
  })
  price?: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled',
    comment: '排课状态',
  })
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

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

  // 外键关联
  @Column({
    name: 'course_id',
    type: 'uuid',
    nullable: false,
  })
  courseId: string;

  @Column({
    name: 'coach_id',
    type: 'uuid',
    nullable: false,
  })
  coachId: string;

  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  // 关联关系
  @ManyToOne(() => Course, (course) => course.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Coach, (coach) => coach.schedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;

  @ManyToOne(() => Store, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Booking, (booking) => booking.courseSchedule)
  bookings: Booking[];

  // 业务方法
  isAvailable(): boolean {
    return (
      this.status === 'scheduled' &&
      this.currentParticipants < this.maxParticipants &&
      new Date(this.startTime) > new Date()
    );
  }

  isFull(): boolean {
    return this.currentParticipants >= this.maxParticipants;
  }

  canCancel(): boolean {
    if (this.status !== 'scheduled') return false;
    
    // 开始前3小时内不能取消排课
    const threeHoursFromNow = new Date(Date.now() + 3 * 60 * 60 * 1000);
    return new Date(this.startTime) > threeHoursFromNow;
  }

  addParticipant(): boolean {
    if (!this.isAvailable()) return false;
    
    this.currentParticipants += 1;
    return true;
  }

  removeParticipant(): boolean {
    if (this.currentParticipants <= 0) return false;
    
    this.currentParticipants -= 1;
    return true;
  }

  getActualPrice(): number {
    return this.price || this.course?.price || 0;
  }

  getDuration(): number {
    const diffMs = new Date(this.endTime).getTime() - new Date(this.startTime).getTime();
    return Math.floor(diffMs / (1000 * 60)); // 返回分钟数
  }

  isUpcoming(): boolean {
    return new Date(this.startTime) > new Date();
  }

  isOngoing(): boolean {
    const now = new Date();
    return new Date(this.startTime) <= now && new Date(this.endTime) >= now;
  }

  isPast(): boolean {
    return new Date(this.endTime) < new Date();
  }

  cancel(reason?: string): boolean {
    if (!this.canCancel()) return false;
    
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
    return true;
  }

  complete(): void {
    this.status = 'completed';
  }

  start(): void {
    if (this.status === 'scheduled') {
      this.status = 'ongoing';
    }
  }
}
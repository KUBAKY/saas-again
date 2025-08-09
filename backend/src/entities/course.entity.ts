import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Store } from './store.entity';
import { Coach } from './coach.entity';
import { Booking } from './booking.entity';
import { CourseSchedule } from './course-schedule.entity';

@Entity('courses')
@Index(['storeId', 'name'])
export class Course extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '课程名称',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '课程描述',
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['personal', 'group', 'workshop'],
    nullable: false,
    comment: '课程类型',
  })
  type: 'personal' | 'group' | 'workshop';

  @Column({
    type: 'enum',
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all',
    comment: '适合级别',
  })
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';

  @Column({
    type: 'int',
    nullable: false,
    comment: '课程时长（分钟）',
  })
  duration: number;

  @Column({
    type: 'int',
    nullable: false,
    comment: '最大参与人数',
  })
  maxParticipants: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '课程价格',
  })
  price: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '课程封面图URL',
  })
  coverImage?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '课程标签',
  })
  tags?: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '所需器材',
  })
  equipment?: string[];

  @Column({
    type: 'text',
    nullable: true,
    comment: '注意事项',
  })
  requirements?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '消耗卡路里（估算）',
  })
  caloriesBurn: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 5.0,
    comment: '平均评分',
  })
  rating: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '评价总数',
  })
  reviewCount: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '总参与次数',
  })
  totalParticipants: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    comment: '课程状态',
  })
  status: 'active' | 'inactive' | 'suspended';

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '课程设置',
  })
  settings?: Record<string, any>;

  // 外键关联
  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  @Column({
    name: 'coach_id',
    type: 'uuid',
    nullable: true,
    comment: '主要教练ID',
  })
  coachId?: string;

  // 关联关系
  @ManyToOne(() => Store, (store) => store.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Coach, (coach) => coach.courses, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'coach_id' })
  coach?: Coach;

  @OneToMany(() => Booking, (booking) => booking.course)
  bookings: Booking[];

  @OneToMany(() => CourseSchedule, (schedule) => schedule.course)
  schedules: CourseSchedule[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  isPersonalTraining(): boolean {
    return this.type === 'personal';
  }

  isGroupClass(): boolean {
    return this.type === 'group';
  }

  canAccommodate(participants: number): boolean {
    return participants <= this.maxParticipants;
  }

  getDurationHours(): number {
    return Math.round((this.duration / 60) * 100) / 100;
  }

  updateRating(newRating: number) {
    const totalScore = this.rating * this.reviewCount + newRating;
    this.reviewCount += 1;
    this.rating = Math.round((totalScore / this.reviewCount) * 100) / 100;
  }

  incrementParticipants() {
    this.totalParticipants += 1;
  }

  hasTag(tag: string): boolean {
    return this.tags?.includes(tag) || false;
  }

  requiresEquipment(equipment: string): boolean {
    return this.equipment?.includes(equipment) || false;
  }

  isPopular(): boolean {
    return this.totalParticipants > 100 && this.rating >= 4.5;
  }

  getBookingCount(): number {
    return this.bookings?.length || 0;
  }

  getActiveBookings(): Booking[] {
    return (
      this.bookings?.filter(
        (booking) =>
          booking.status === 'confirmed' &&
          new Date(booking.startTime) > new Date(),
      ) || []
    );
  }

  getCurrentBookings(): Booking[] {
    const now = new Date();
    return (
      this.bookings?.filter(
        (booking) =>
          booking.status === 'confirmed' &&
          new Date(booking.startTime) <= now &&
          new Date(booking.endTime) >= now,
      ) || []
    );
  }
}

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
import { Course } from './course.entity';
import { Booking } from './booking.entity';

@Entity('coaches')
@Index(['employeeNumber'], { unique: true })
export class Coach extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
    comment: '教练工号',
  })
  employeeNumber: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '教练姓名',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '手机号码',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '邮箱地址',
  })
  email?: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other'],
    nullable: false,
    comment: '性别',
  })
  gender: 'male' | 'female' | 'other';

  @Column({
    type: 'date',
    nullable: true,
    comment: '生日',
  })
  birthday?: Date;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '头像URL',
  })
  avatar?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '个人简介',
  })
  bio?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '专业技能',
  })
  specialties?: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '资格证书',
  })
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    certificateUrl?: string;
  }>;

  @Column({
    type: 'int',
    nullable: true,
    comment: '从业年限',
  })
  experienceYears?: number;

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
    type: 'date',
    nullable: false,
    comment: '入职日期',
  })
  hireDate: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '基本工资',
  })
  baseSalary?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '课时费',
  })
  hourlyRate?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '提成比例',
  })
  commissionRate?: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '工作时间安排',
  })
  workSchedule?: Record<string, {
    start: string;
    end: string;
    available: boolean;
  }>;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'on_leave', 'resigned'],
    default: 'active',
    comment: '教练状态',
  })
  status: 'active' | 'inactive' | 'on_leave' | 'resigned';

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

  // 外键关联
  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  // 关联关系
  @ManyToOne(() => Store, (store) => store.coaches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Course, (course) => course.coach)
  courses: Course[];

  @OneToMany(() => Booking, (booking) => booking.coach)
  bookings: Booking[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  isAvailable(): boolean {
    return this.isActive() && this.status !== 'on_leave';
  }

  getAge(): number | null {
    if (!this.birthday) return null;
    
    const today = new Date();
    const birthDate = new Date(this.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getWorkExperience(): number {
    const today = new Date();
    const hireYear = new Date(this.hireDate).getFullYear();
    return today.getFullYear() - hireYear;
  }

  hasSpecialty(specialty: string): boolean {
    return this.specialties?.includes(specialty) || false;
  }

  isAvailableAt(dayOfWeek: string, time: string): boolean {
    if (!this.workSchedule || !this.workSchedule[dayOfWeek]) {
      return false;
    }

    const schedule = this.workSchedule[dayOfWeek];
    if (!schedule.available) return false;

    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(schedule.start);
    const endMinutes = this.timeToMinutes(schedule.end);

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  updateRating(newRating: number) {
    const totalScore = this.rating * this.reviewCount + newRating;
    this.reviewCount += 1;
    this.rating = Math.round((totalScore / this.reviewCount) * 100) / 100;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getTotalCourses(): number {
    return this.courses?.length || 0;
  }

  getActiveCourses(): Course[] {
    return this.courses?.filter(course => course.isActive()) || [];
  }
}
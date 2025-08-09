import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Brand } from './brand.entity';
import { User } from './user.entity';
// Forward declarations to avoid circular imports

@Entity('stores')
@Index(['brandId', 'code'], { unique: true })
export class Store extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '门店名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '门店代码',
  })
  code: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '门店描述',
  })
  description?: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: '门店地址',
  })
  address: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '联系电话',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '联系邮箱',
  })
  email?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: '纬度',
  })
  latitude?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
    comment: '经度',
  })
  longitude?: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '营业时间开始',
  })
  openTime: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: '营业时间结束',
  })
  closeTime: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '门店面积（平方米）',
  })
  area?: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '最大容纳人数',
  })
  capacity?: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '门店设施信息',
  })
  facilities?: string[];

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '门店配置信息',
  })
  settings?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
    comment: '门店状态',
  })
  status: 'active' | 'inactive' | 'maintenance';

  // 外键关联
  @Column({
    name: 'brand_id',
    type: 'uuid',
    nullable: false,
  })
  brandId: string;

  // 关联关系
  @ManyToOne(() => Brand, (brand) => brand.stores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => User, (user) => user.store)
  employees: User[];

  @OneToMany('Member', (member: any) => member.store)
  members: any[];

  @OneToMany('Coach', (coach: any) => coach.store)
  coaches: any[];

  @OneToMany('Course', (course: any) => course.store)
  courses: any[];

  @OneToMany('CourseSchedule', (schedule: any) => schedule.store)
  schedules: any[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  isOpen(time: Date = new Date()): boolean {
    const currentHour = time.getHours();
    const currentMinute = time.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [openHour, openMinute] = this.openTime.split(':').map(Number);
    const openTimeMinutes = openHour * 60 + openMinute;

    const [closeHour, closeMinute] = this.closeTime.split(':').map(Number);
    const closeTimeMinutes = closeHour * 60 + closeMinute;

    return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
  }

  getDistance(lat: number, lng: number): number {
    if (!this.latitude || !this.longitude) return Infinity;

    const R = 6371; // 地球半径（公里）
    const dLat = this.toRad(lat - this.latitude);
    const dLon = this.toRad(lng - this.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(this.latitude)) *
        Math.cos(this.toRad(lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}

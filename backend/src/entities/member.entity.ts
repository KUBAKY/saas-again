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
import { MembershipCard } from './membership-card.entity';
import { CheckIn } from './check-in.entity';
import { Booking } from './booking.entity';

@Entity('members')
@Index(['phone'], { unique: true })
@Index(['memberNumber'], { unique: true })
export class Member extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
    comment: '会员编号',
  })
  memberNumber: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '会员姓名',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
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
    nullable: true,
    comment: '性别',
  })
  gender?: 'male' | 'female' | 'other';

  @Column({
    type: 'date',
    nullable: true,
    comment: '生日',
  })
  birthday?: Date;

  @Column({
    type: 'varchar',
    length: 18,
    nullable: true,
    comment: '身份证号',
  })
  idCard?: string;

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
    comment: '地址',
  })
  address?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '紧急联系人',
  })
  emergencyContact?: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '紧急联系人电话',
  })
  emergencyPhone?: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '身高（cm）',
  })
  height?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: '体重（kg）',
  })
  weight?: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: '健康状况说明',
  })
  healthNote?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '健身目标',
  })
  fitnessGoal?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '身体指标历史记录',
  })
  bodyMetrics?: Array<{
    date: string;
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
    bmi?: number;
    notes?: string;
  }>;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '微信OpenID',
  })
  wechatOpenId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '微信UnionID',
  })
  wechatUnionId?: string;

  @Column({
    type: 'enum',
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze',
    comment: '会员等级',
  })
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

  @Column({
    type: 'int',
    default: 0,
    comment: '积分',
  })
  points: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '最后签到时间',
  })
  lastCheckInAt?: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'expired'],
    default: 'active',
    comment: '会员状态',
  })
  status: 'active' | 'inactive' | 'suspended' | 'expired';

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '会员偏好设置',
  })
  preferences?: Record<string, any>;

  // 外键关联
  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  // 关联关系
  @ManyToOne(() => Store, (store) => store.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => MembershipCard, (card) => card.member)
  membershipCards: MembershipCard[];

  @OneToMany(() => CheckIn, (checkIn) => checkIn.member)
  checkIns: CheckIn[];

  @OneToMany(() => Booking, (booking) => booking.member)
  bookings: Booking[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
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

  getBMI(): number | null {
    if (!this.height || !this.weight) return null;
    
    const heightInMeters = this.height / 100;
    return Math.round((this.weight / (heightInMeters * heightInMeters)) * 100) / 100;
  }

  getActiveMembershipCards(): MembershipCard[] {
    return this.membershipCards?.filter(card => card.isActive()) || [];
  }

  hasActiveMembership(): boolean {
    return this.getActiveMembershipCards().length > 0;
  }

  getTotalCheckIns(): number {
    return this.checkIns?.length || 0;
  }

  getCheckInStreak(): number {
    if (!this.checkIns || this.checkIns.length === 0) return 0;

    // 按日期排序
    const sortedCheckIns = this.checkIns.sort(
      (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.checkInTime);
      checkInDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = checkInDate;
      } else {
        break;
      }
    }

    return streak;
  }

  addBodyMetric(metric: {
    weight: number;
    bodyFat?: number;
    muscleMass?: number;
    bmi?: number;
    notes?: string;
  }) {
    if (!this.bodyMetrics) {
      this.bodyMetrics = [];
    }

    this.bodyMetrics.push({
      date: new Date().toISOString().split('T')[0],
      ...metric,
    });

    // 更新当前体重
    this.weight = metric.weight;
  }

  getLatestBodyMetric() {
    if (!this.bodyMetrics || this.bodyMetrics.length === 0) return null;
    
    return this.bodyMetrics.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }
}
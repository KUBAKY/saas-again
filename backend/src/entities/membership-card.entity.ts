import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';

@Entity('membership_cards')
@Index(['cardNumber'], { unique: true })
export class MembershipCard extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
    comment: '卡号',
  })
  cardNumber: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '卡类型名称',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['times', 'period', 'unlimited'],
    nullable: false,
    comment: '计费方式',
  })
  billingType: 'times' | 'period' | 'unlimited';

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '卡片价格',
  })
  price: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '总次数（次卡）',
  })
  totalSessions?: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '已使用次数',
  })
  usedSessions: number;

  @Column({
    type: 'int',
    nullable: true,
    comment: '有效期（天数）',
  })
  validityDays?: number;

  @Column({
    type: 'date',
    nullable: false,
    comment: '开卡日期',
  })
  issueDate: Date;

  @Column({
    type: 'date',
    nullable: true,
    comment: '到期日期',
  })
  expiryDate?: Date;

  @Column({
    type: 'date',
    nullable: true,
    comment: '激活日期',
  })
  activationDate?: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'expired', 'frozen', 'refunded'],
    default: 'inactive',
    comment: '卡状态',
  })
  status: 'active' | 'inactive' | 'expired' | 'frozen' | 'refunded';

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '卡片配置',
  })
  settings?: Record<string, any>;

  // 外键关联
  @Column({
    name: 'member_id',
    type: 'uuid',
    nullable: false,
  })
  memberId: string;

  // 关联关系
  @ManyToOne(() => Member, (member) => member.membershipCards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt && !this.isExpired();
  }

  isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > new Date(this.expiryDate);
  }

  getRemainingDays(): number | null {
    if (!this.expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  getRemainingTimes(): number | null {
    if (this.billingType !== 'times' || !this.totalSessions) return null;
    return Math.max(0, this.totalSessions - this.usedSessions);
  }

  canUse(): boolean {
    if (!this.isActive()) return false;
    
    if (this.billingType === 'times') {
      return (this.getRemainingTimes() || 0) > 0;
    }
    
    return true;
  }

  use(): boolean {
    if (!this.canUse()) return false;
    
    if (this.billingType === 'times') {
      this.usedSessions += 1;
      
      // 检查是否用完
      if (this.getRemainingTimes() === 0) {
        this.status = 'expired';
      }
    }
    
    return true;
  }

  activate(): void {
    if (this.status !== 'inactive') return;
    
    this.status = 'active';
    this.activationDate = new Date();
    
    // 设置到期日期
    if (this.validityDays && !this.expiryDate) {
      const expiryDate = new Date(this.activationDate);
      expiryDate.setDate(expiryDate.getDate() + this.validityDays);
      this.expiryDate = expiryDate;
    }
  }

  freeze(): void {
    if (this.status === 'active') {
      this.status = 'frozen';
    }
  }

  unfreeze(): void {
    if (this.status === 'frozen') {
      this.status = 'active';
    }
  }

  refund(): void {
    this.status = 'refunded';
  }

  getUsagePercentage(): number {
    if (this.billingType !== 'times' || !this.totalSessions) return 0;
    return Math.round((this.usedSessions / this.totalSessions) * 100);
  }
}
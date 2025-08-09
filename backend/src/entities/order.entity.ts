import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { Payment } from './payment.entity';
import { MembershipCard } from './membership-card.entity';
import { Course } from './course.entity';

@Entity('orders')
@Index(['orderNumber'], { unique: true })
export class Order extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
    comment: '订单号',
  })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: ['membership_card', 'course', 'personal_training', 'product'],
    nullable: false,
    comment: '订单类型',
  })
  type: 'membership_card' | 'course' | 'personal_training' | 'product';

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled', 'refunded', 'expired'],
    default: 'pending',
    comment: '订单状态',
  })
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'expired';

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '订单总金额',
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '折扣金额',
  })
  discountAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '实付金额',
  })
  paidAmount: number;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '订单描述',
  })
  description?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '支付时间',
  })
  paidAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '取消时间',
  })
  cancelledAt?: Date;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '取消原因',
  })
  cancelReason?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '过期时间',
  })
  expiresAt?: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '订单详情',
  })
  orderDetails?: {
    items: {
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[];
    membershipCardType?: string;
    courseId?: string;
    coachId?: string;
    sessionCount?: number;
    validityDays?: number;
  };

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '订单元数据',
  })
  metadata?: Record<string, any>;

  // 关联字段
  @Column({
    name: 'member_id',
    type: 'uuid',
    nullable: false,
  })
  memberId: string;

  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  @Column({
    name: 'brand_id',
    type: 'uuid',
    nullable: false,
  })
  brandId: string;

  @ManyToOne(() => Member, (member) => member.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  // 业务方法
  isPaid(): boolean {
    return this.status === 'paid';
  }

  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  isExpired(): boolean {
    return (
      this.status === 'expired' ||
      (this.expiresAt ? this.expiresAt < new Date() : false)
    );
  }

  canCancel(): boolean {
    return this.status === 'pending';
  }

  canRefund(): boolean {
    return this.status === 'paid';
  }

  getTotalPaidAmount(): number {
    return (
      this.payments
        ?.filter((payment) => payment.status === 'completed')
        ?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    );
  }

  getRemainingAmount(): number {
    return Math.max(0, this.paidAmount - this.getTotalPaidAmount());
  }

  isFullyPaid(): boolean {
    return this.getTotalPaidAmount() >= this.paidAmount;
  }
}

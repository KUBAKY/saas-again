import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@Entity('payments')
@Index(['paymentNumber'], { unique: true })
export class Payment extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
    comment: '支付单号',
  })
  paymentNumber: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '支付金额',
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['wechat', 'alipay', 'cash', 'card', 'transfer'],
    nullable: false,
    comment: '支付方式',
  })
  paymentMethod: 'wechat' | 'alipay' | 'cash' | 'card' | 'transfer';

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    comment: '支付状态',
  })
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '支付描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '第三方交易ID',
  })
  thirdPartyTransactionId?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '支付完成时间',
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
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '退款金额',
  })
  refundAmount: number;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '退款原因',
  })
  refundReason?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: '退款时间',
  })
  refundedAt?: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '支付元数据',
  })
  metadata?: Record<string, any>;

  // 关联字段
  @Column({
    name: 'order_id',
    type: 'uuid',
    nullable: false,
  })
  orderId: string;

  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: false,
  })
  storeId: string;

  @ManyToOne(() => Order, (order) => order.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // 业务方法
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  canRefund(): boolean {
    return this.status === 'completed' && this.refundAmount < this.amount;
  }

  getRemainingRefundAmount(): number {
    return this.amount - (this.refundAmount || 0);
  }

  isFullyRefunded(): boolean {
    return this.refundAmount >= this.amount;
  }
}

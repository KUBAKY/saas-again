import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { Store } from './store.entity';

@Entity('check_ins')
@Index(['memberId', 'checkInTime'])
@Index(['storeId', 'checkInTime'])
export class CheckIn extends BaseEntity {
  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    comment: '签到时间',
  })
  checkInTime: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '签出时间',
  })
  checkOutTime?: Date;

  @Column({
    type: 'enum',
    enum: ['manual', 'qr_code', 'nfc', 'app'],
    default: 'app',
    comment: '签到方式',
  })
  method: 'manual' | 'qr_code' | 'nfc' | 'app';

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '签到设备信息',
  })
  deviceInfo?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

  // 外键关联
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

  // 关联关系
  @ManyToOne(() => Member, (member) => member.checkIns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Store, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  // 业务方法
  getDuration(): number | null {
    if (!this.checkOutTime) return null;

    const diffMs =
      new Date(this.checkOutTime).getTime() -
      new Date(this.checkInTime).getTime();
    return Math.floor(diffMs / (1000 * 60)); // 返回分钟数
  }

  isCurrentlyInside(): boolean {
    return !this.checkOutTime;
  }

  checkOut(time: Date = new Date()): void {
    if (!this.checkOutTime) {
      this.checkOutTime = time;
    }
  }
}

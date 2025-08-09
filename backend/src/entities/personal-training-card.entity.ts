import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { MembershipCard } from './membership-card.entity';
import { Coach } from './coach.entity';

@Entity('personal_training_cards')
@Index(['cardNumber'], { unique: true })
export class PersonalTrainingCard extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
    comment: '私教卡号',
  })
  cardNumber: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '私教卡类型名称',
  })
  type: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '私教卡价格',
  })
  price: number;

  @Column({
    type: 'int',
    nullable: false,
    comment: '总课时数',
  })
  totalSessions: number;

  @Column({
    type: 'int',
    default: 0,
    comment: '已使用课时数',
  })
  usedSessions: number;

  @Column({
    type: 'date',
    nullable: false,
    comment: '购买日期',
  })
  purchaseDate: Date;

  @Column({
    type: 'date',
    nullable: true,
    comment: '激活日期',
  })
  activationDate?: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'expired', 'frozen'],
    default: 'inactive',
    comment: '私教卡状态',
  })
  status: 'active' | 'inactive' | 'expired' | 'frozen';

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注信息',
  })
  notes?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '私教卡配置',
  })
  settings?: Record<string, any>;

  // 外键关联
  @Column({
    name: 'member_id',
    type: 'uuid',
    nullable: false,
  })
  memberId: string;

  @Column({
    name: 'membership_card_id',
    type: 'uuid',
    nullable: false,
    comment: '关联的会籍卡ID',
  })
  membershipCardId: string;

  @Column({
    name: 'coach_id',
    type: 'uuid',
    nullable: true,
    comment: '指定教练ID',
  })
  coachId?: string;

  // 关联关系
  @ManyToOne(() => Member, (member) => member.personalTrainingCards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(
    () => MembershipCard,
    (membershipCard) => membershipCard.personalTrainingCards,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'membership_card_id' })
  membershipCard: MembershipCard;

  @ManyToOne(() => Coach, (coach) => coach.personalTrainingCards, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'coach_id' })
  coach?: Coach;

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt && !this.isExpired();
  }

  isExpired(): boolean {
    // 私教卡的有效期依赖于关联的会籍卡
    return false; // 需要通过关联的会籍卡来判断
  }

  getRemainingTimes(): number {
    return Math.max(0, this.totalSessions - this.usedSessions);
  }

  canUse(): boolean {
    if (!this.isActive()) return false;
    return this.getRemainingTimes() > 0;
  }

  use(): boolean {
    if (!this.canUse()) return false;

    this.usedSessions += 1;

    // 检查是否用完
    if (this.getRemainingTimes() === 0) {
      this.status = 'expired';
    }

    return true;
  }

  activate(): void {
    if (this.status !== 'inactive') return;

    this.status = 'active';
    this.activationDate = new Date();
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

  assignCoach(coachId: string): void {
    this.coachId = coachId;
  }

  removeCoach(): void {
    this.coachId = undefined;
  }
}

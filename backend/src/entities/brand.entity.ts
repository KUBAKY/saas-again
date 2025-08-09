import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Store } from './store.entity';
import { User } from './user.entity';

@Entity('brands')
@Index(['name'], { unique: true })
export class Brand extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '品牌名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
    comment: '品牌代码，用于数据隔离',
  })
  code: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '品牌描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '品牌Logo URL',
  })
  logoUrl?: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '联系电话',
  })
  contactPhone?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '联系邮箱',
  })
  contactEmail?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '品牌地址',
  })
  address?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '品牌配置信息',
  })
  settings?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    comment: '品牌状态',
  })
  status: 'active' | 'inactive' | 'suspended';

  // 关联关系
  @OneToMany(() => Store, (store) => store.brand, {
    cascade: true,
  })
  stores: Store[];

  @OneToMany(() => User, (user) => user.brand, {
    cascade: true,
  })
  users: User[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  getStoreCount(): number {
    return this.stores?.length || 0;
  }
}

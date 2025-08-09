import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Brand } from './brand.entity';
import { Store } from './store.entity';
// Forward declarations to avoid circular imports
import * as bcrypt from 'bcryptjs';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['phone'], { unique: true })
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
    comment: '邮箱地址',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: true,
    comment: '手机号码',
  })
  phone?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
    comment: '密码哈希',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '真实姓名',
  })
  realName: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: '昵称',
  })
  nickname?: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '头像URL',
  })
  avatar?: string;

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
    type: 'text',
    nullable: true,
    comment: '地址',
  })
  address?: string;

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
    type: 'timestamp with time zone',
    nullable: true,
    comment: '最后登录时间',
  })
  lastLoginAt?: Date;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: '最后登录IP',
  })
  lastLoginIp?: string;

  @Column({
    type: 'int',
    default: 0,
    comment: '登录失败次数',
  })
  failedLoginAttempts: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '账户锁定时间',
  })
  lockedAt?: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '邮箱验证时间',
  })
  emailVerifiedAt?: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    comment: '手机验证时间',
  })
  phoneVerifiedAt?: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending',
    comment: '用户状态',
  })
  status: 'active' | 'inactive' | 'suspended' | 'pending';

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '用户配置信息',
  })
  preferences?: Record<string, any>;

  // 外键关联
  @Column({
    name: 'brand_id',
    type: 'uuid',
    nullable: false,
  })
  brandId: string;

  @Column({
    name: 'store_id',
    type: 'uuid',
    nullable: true,
    comment: '所属门店ID（员工）',
  })
  storeId?: string;

  // 关联关系
  @ManyToOne(() => Brand, (brand) => brand.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Store, (store) => store.employees, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'store_id' })
  store?: Store;

  @ManyToMany('Role', (role: any) => role.users, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: any[];

  // 生命周期钩子
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // 业务方法
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt && !this.isLocked();
  }

  isLocked(): boolean {
    if (!this.lockedAt) return false;
    
    // 锁定时间超过30分钟自动解锁
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return this.lockedAt > thirtyMinutesAgo;
  }

  isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  isPhoneVerified(): boolean {
    return !!this.phoneVerifiedAt;
  }

  hasRole(roleName: string): boolean {
    return this.roles?.some(role => role.name === roleName) || false;
  }

  getPermissions(): string[] {
    if (!this.roles) return [];
    
    return this.roles.reduce((permissions, role) => {
      if (role.permissions) {
        permissions.push(...role.permissions.map(p => p.name));
      }
      return permissions;
    }, [] as string[]);
  }

  canAccessStore(storeId: string): boolean {
    // 总部管理员可以访问所有门店
    if (this.hasRole('ADMIN')) return true;
    
    // 品牌管理员可以访问品牌下所有门店
    if (this.hasRole('BRAND_MANAGER')) return true;
    
    // 门店相关角色只能访问自己的门店
    return this.storeId === storeId;
  }

  resetFailedLoginAttempts() {
    this.failedLoginAttempts = 0;
    this.lockedAt = undefined;
  }

  incrementFailedLoginAttempts() {
    this.failedLoginAttempts += 1;
    
    // 连续失败5次锁定账户
    if (this.failedLoginAttempts >= 5) {
      this.lockedAt = new Date();
    }
  }
}
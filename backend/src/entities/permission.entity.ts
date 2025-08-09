import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['name'], { unique: true })
export class Permission extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
    comment: '权限名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '权限显示名称',
  })
  displayName: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '权限描述',
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '权限分组',
  })
  group: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '资源标识',
  })
  resource: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '操作类型',
  })
  action: string;

  @Column({
    type: 'enum',
    enum: ['system', 'custom'],
    default: 'custom',
    comment: '权限类型',
  })
  type: 'system' | 'custom';

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: '权限状态',
  })
  status: 'active' | 'inactive';

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '权限配置信息',
  })
  settings?: Record<string, any>;

  // 关联关系
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  isSystemPermission(): boolean {
    return this.type === 'system';
  }

  getRoleCount(): number {
    return this.roles?.length || 0;
  }

  getFullName(): string {
    return `${this.resource}:${this.action}`;
  }

  static createPermissionName(resource: string, action: string): string {
    return `${resource}:${action}`;
  }
}

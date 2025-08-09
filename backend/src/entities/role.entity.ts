import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['name'], { unique: true })
export class Role extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
    comment: '角色名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '角色显示名称',
  })
  displayName: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: '角色描述',
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['system', 'custom'],
    default: 'custom',
    comment: '角色类型',
  })
  type: 'system' | 'custom';

  @Column({
    type: 'int',
    default: 0,
    comment: '角色优先级（数字越大优先级越高）',
  })
  priority: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: '角色状态',
  })
  status: 'active' | 'inactive';

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: '角色配置信息',
  })
  settings?: Record<string, any>;

  // 关联关系
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  // 业务方法
  isActive(): boolean {
    return this.status === 'active' && !this.deletedAt;
  }

  hasPermission(permissionName: string): boolean {
    return (
      this.permissions?.some(
        (permission) =>
          permission.name === permissionName && permission.isActive(),
      ) || false
    );
  }

  getPermissionNames(): string[] {
    return this.permissions?.map((permission) => permission.name) || [];
  }

  isSystemRole(): boolean {
    return this.type === 'system';
  }

  getUserCount(): number {
    return this.users?.length || 0;
  }
}

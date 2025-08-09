import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class Role extends BaseEntity {
    name: string;
    displayName: string;
    description?: string;
    type: 'system' | 'custom';
    priority: number;
    status: 'active' | 'inactive';
    settings?: Record<string, any>;
    users: User[];
    permissions: Permission[];
    isActive(): boolean;
    hasPermission(permissionName: string): boolean;
    getPermissionNames(): string[];
    isSystemRole(): boolean;
    getUserCount(): number;
}

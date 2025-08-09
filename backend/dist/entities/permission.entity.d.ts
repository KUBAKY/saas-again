import { BaseEntity } from './base.entity';
import { Role } from './role.entity';
export declare class Permission extends BaseEntity {
    name: string;
    displayName: string;
    description?: string;
    group: string;
    resource: string;
    action: string;
    type: 'system' | 'custom';
    status: 'active' | 'inactive';
    settings?: Record<string, any>;
    roles: Role[];
    isActive(): boolean;
    isSystemPermission(): boolean;
    getRoleCount(): number;
    getFullName(): string;
    static createPermissionName(resource: string, action: string): string;
}

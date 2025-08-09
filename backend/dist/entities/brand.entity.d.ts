import { BaseEntity } from './base.entity';
import { Store } from './store.entity';
import { User } from './user.entity';
export declare class Brand extends BaseEntity {
    name: string;
    code: string;
    description?: string;
    logoUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    settings?: Record<string, any>;
    status: 'active' | 'inactive' | 'suspended';
    stores: Store[];
    users: User[];
    isActive(): boolean;
    getStoreCount(): number;
}

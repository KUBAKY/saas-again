export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    realName: string;
    phone?: string;
    brandId: string;
    storeId?: string;
    status?: 'active' | 'inactive';
    roleIds?: string[];
    avatar?: string;
    notes?: string;
}

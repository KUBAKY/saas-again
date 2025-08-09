export declare class CreateMemberDto {
    name: string;
    phone: string;
    email?: string;
    gender: 'male' | 'female';
    birthday?: string;
    height?: number;
    weight?: number;
    storeId: string;
    level?: 'bronze' | 'silver' | 'gold' | 'platinum';
    fitnessGoal?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    avatar?: string;
    notes?: string;
}

export declare class CreateCoachDto {
    name: string;
    employeeNumber: string;
    phone: string;
    email?: string;
    gender: 'male' | 'female';
    storeId: string;
    hireDate?: string;
    specialties?: string[];
    experienceYears?: number;
    bio?: string;
    baseSalary?: number;
    hourlyRate?: number;
    avatar?: string;
    certifications?: string[];
    notes?: string;
}

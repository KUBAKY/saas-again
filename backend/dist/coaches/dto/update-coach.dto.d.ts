import { CreateCoachDto } from './create-coach.dto';
declare const UpdateCoachDto_base: import("@nestjs/common").Type<Partial<Omit<CreateCoachDto, "storeId" | "employeeNumber">>>;
export declare class UpdateCoachDto extends UpdateCoachDto_base {
}
export {};

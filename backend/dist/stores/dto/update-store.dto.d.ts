import { CreateStoreDto } from './create-store.dto';
declare const UpdateStoreDto_base: import("@nestjs/common").Type<Partial<Omit<CreateStoreDto, "brandId" | "code">>>;
export declare class UpdateStoreDto extends UpdateStoreDto_base {
}
export {};

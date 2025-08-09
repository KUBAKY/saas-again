import { CreateGroupClassCardDto } from './create-group-class-card.dto';
declare const UpdateGroupClassCardDto_base: import("@nestjs/common").Type<Partial<CreateGroupClassCardDto>>;
export declare class UpdateGroupClassCardDto extends UpdateGroupClassCardDto_base {
    status?: 'inactive' | 'active' | 'frozen' | 'expired' | 'refunded';
}
export {};

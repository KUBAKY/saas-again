import { CreatePersonalTrainingCardDto } from './create-personal-training-card.dto';
declare const UpdatePersonalTrainingCardDto_base: import("@nestjs/common").Type<Partial<CreatePersonalTrainingCardDto>>;
export declare class UpdatePersonalTrainingCardDto extends UpdatePersonalTrainingCardDto_base {
    status?: 'inactive' | 'active' | 'frozen' | 'expired' | 'refunded';
}
export {};

export declare class CreatePersonalTrainingCardDto {
    memberId: string;
    membershipCardId: string;
    type: string;
    price: number;
    totalSessions: number;
    coachId?: string;
    purchaseDate?: string;
    notes?: string;
    settings?: Record<string, any>;
}

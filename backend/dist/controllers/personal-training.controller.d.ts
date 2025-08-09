import { User } from '../entities/user.entity';
export declare class PersonalTrainingController {
    createBooking(user: User, req: any, createBookingDto: any): Promise<{
        message: string;
        coachId: string;
        coachName: string;
        specializationType: "personal" | "group" | "both";
    }>;
    getMySessions(user: User, req: any, status?: string): Promise<{
        message: string;
        coachId: string;
        sessions: never[];
        filter: {
            status: string | undefined;
        };
    }>;
    completeSession(sessionId: string, user: User, req: any): Promise<{
        message: string;
        sessionId: string;
        coachId: string;
        completedAt: Date;
    }>;
    getPersonalTrainingCards(memberId?: string, req?: any): Promise<{
        message: string;
        coachId: string;
        cards: never[];
        filter: {
            memberId: string | undefined;
        };
    }>;
    usePersonalTrainingCard(cardId: string, user: User, req: any): Promise<{
        message: string;
        cardId: string;
        coachId: string;
        usedAt: Date;
    }>;
}

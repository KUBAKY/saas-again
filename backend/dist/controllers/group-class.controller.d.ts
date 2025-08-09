import { User } from '../entities/user.entity';
export declare class GroupClassController {
    createSchedule(user: User, req: any, createScheduleDto: any): Promise<{
        message: string;
        coachId: string;
        coachName: string;
        specializationType: "group" | "personal" | "both";
        maxStudents: number;
    }>;
    getMyClasses(user: User, req: any, date?: string): Promise<{
        message: string;
        coachId: string;
        classes: never[];
        filter: {
            date: string | undefined;
        };
        maxStudentsPerClass: number;
    }>;
    startClass(classId: string, user: User, req: any): Promise<{
        message: string;
        classId: string;
        coachId: string;
        startedAt: Date;
    }>;
    checkinMember(classId: string, checkinDto: {
        memberId: string;
    }, user: User, req: any): Promise<{
        message: string;
        classId: string;
        memberId: string;
        coachId: string;
        checkinAt: Date;
    }>;
    getGroupClassCards(memberId?: string, req?: any): Promise<{
        message: string;
        coachId: string;
        cards: never[];
        filter: {
            memberId: string | undefined;
        };
    }>;
    useGroupClassCard(cardId: string, user: User, req: any): Promise<{
        message: string;
        cardId: string;
        coachId: string;
        usedAt: Date;
    }>;
    getStatistics(period: string | undefined, req: any): Promise<{
        message: string;
        coachId: string;
        period: string;
        statistics: {
            totalClasses: number;
            totalStudents: number;
            averageAttendance: number;
            maxStudentsPerClass: number;
        };
    }>;
}

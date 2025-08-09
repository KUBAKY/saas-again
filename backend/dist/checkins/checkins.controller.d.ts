import { CheckInsService } from './checkins.service';
import { CreateCheckInDto, UpdateCheckInDto, QueryCheckInDto } from './dto';
import { User } from '../entities/user.entity';
export declare class CheckInsController {
    private readonly checkInsService;
    constructor(checkInsService: CheckInsService);
    create(createCheckInDto: CreateCheckInDto, user: User): Promise<import("../entities").CheckIn>;
    checkInByQRCode(qrCode: string, memberId: string, user: User): Promise<import("../entities").CheckIn>;
    findAll(queryDto: QueryCheckInDto, user: User): Promise<{
        data: import("../entities").CheckIn[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStats(user: User): Promise<{
        total: number;
        today: number;
        week: number;
        month: number;
        byMethod: {
            manual: number;
            qrCode: number;
            facial: number;
        };
    }>;
    getTodayCheckIns(storeId: string, user: User): Promise<import("../entities").CheckIn[]>;
    findOne(id: string, user: User): Promise<import("../entities").CheckIn>;
    update(id: string, updateCheckInDto: UpdateCheckInDto, user: User): Promise<import("../entities").CheckIn>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
}

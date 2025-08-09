import { Repository } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { User } from '../entities/user.entity';
import { CreateCheckInDto, UpdateCheckInDto, QueryCheckInDto } from './dto';
export declare class CheckInsService {
    private readonly checkInRepository;
    constructor(checkInRepository: Repository<CheckIn>);
    create(createCheckInDto: CreateCheckInDto, user: User): Promise<CheckIn>;
    checkInByQRCode(qrCode: string, memberId: string, user: User): Promise<CheckIn>;
    findAll(queryDto: QueryCheckInDto, user: User): Promise<{
        data: CheckIn[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user: User): Promise<CheckIn>;
    update(id: string, updateCheckInDto: UpdateCheckInDto, user: User): Promise<CheckIn>;
    remove(id: string, user: User): Promise<{
        message: string;
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
    getTodayCheckIns(storeId: string, user: User): Promise<CheckIn[]>;
    private createBaseQuery;
    private checkDuplicateCheckIn;
    private parseQRCode;
}

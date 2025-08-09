import { MembershipCardsService } from './membership-cards.service';
import { CreateMembershipCardDto, UpdateMembershipCardDto, QueryMembershipCardDto } from './dto';
import { User } from '../entities/user.entity';
export declare class MembershipCardsController {
    private readonly membershipCardsService;
    constructor(membershipCardsService: MembershipCardsService);
    create(createMembershipCardDto: CreateMembershipCardDto, user: User): Promise<import("../entities").MembershipCard>;
    findAll(queryDto: QueryMembershipCardDto, user: User): Promise<{
        items: import("../entities").MembershipCard[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(user: User): Promise<{
        total: number;
        active: number;
        expired: number;
        suspended: number;
    }>;
    findOne(id: string, user: User): Promise<import("../entities").MembershipCard>;
    update(id: string, updateMembershipCardDto: UpdateMembershipCardDto, user: User): Promise<import("../entities").MembershipCard>;
    activate(id: string, user: User): Promise<import("../entities").MembershipCard>;
    suspend(id: string, user: User, reason?: string): Promise<import("../entities").MembershipCard>;
    renew(id: string, renewalPeriod: number, amount: number, user: User): Promise<import("../entities").MembershipCard>;
    remove(id: string, user: User): Promise<import("../entities").MembershipCard>;
}

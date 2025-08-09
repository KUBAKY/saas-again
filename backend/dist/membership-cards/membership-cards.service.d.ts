import { Repository } from 'typeorm';
import { MembershipCard } from '../entities/membership-card.entity';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { CreateMembershipCardDto, UpdateMembershipCardDto, QueryMembershipCardDto } from './dto';
export declare class MembershipCardsService {
    private membershipCardRepository;
    private memberRepository;
    constructor(membershipCardRepository: Repository<MembershipCard>, memberRepository: Repository<Member>);
    create(createMembershipCardDto: CreateMembershipCardDto, user: User): Promise<MembershipCard>;
    findAll(queryDto: QueryMembershipCardDto, user: User): Promise<{
        items: MembershipCard[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, user: User): Promise<MembershipCard>;
    update(id: string, updateMembershipCardDto: UpdateMembershipCardDto, user: User): Promise<MembershipCard>;
    activate(id: string, user: User): Promise<MembershipCard>;
    suspend(id: string, reason: string, user: User): Promise<MembershipCard>;
    renew(id: string, renewalPeriod: number, amount: number, user: User): Promise<MembershipCard>;
    remove(id: string, user: User): Promise<MembershipCard>;
    getStats(user: User): Promise<{
        total: number;
        active: number;
        expired: number;
        suspended: number;
    }>;
}

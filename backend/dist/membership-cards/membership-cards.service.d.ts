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
    validateBenefit(cardId: string, benefitType: string, user: User): Promise<{
        valid: boolean;
        message?: string;
        discount?: number;
    }>;
    useBenefit(cardId: string, benefitType: string, user: User): Promise<MembershipCard>;
    getUsageHistory(cardId: string, user: User): Promise<{
        benefitType: string;
        usedCount: number;
        usageLimit?: number;
    }[]>;
    getExpiringCards(days: number | undefined, user: User): Promise<MembershipCard[]>;
    batchRenew(cardIds: string[], renewalPeriod: number, amount: number, user: User): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    getCardTypeStats(user: User): Promise<{
        cardType: any;
        count: number;
    }[]>;
    transferCard(cardId: string, newMemberId: string, reason: string, user: User): Promise<MembershipCard>;
    freezeCard(cardId: string, freezeDays: number, reason: string, user: User): Promise<MembershipCard>;
    unfreezeCard(cardId: string, user: User): Promise<MembershipCard>;
    upgradeBenefits(cardId: string, newBenefits: Partial<MembershipCard['benefits']>, additionalFee: number, user: User): Promise<MembershipCard>;
    getUsageAnalytics(cardId: string, startDate: Date, endDate: Date, user: User): Promise<{
        totalUsage: number;
        benefitUsage: Record<string, number>;
        usageByDate: Array<{
            date: string;
            count: number;
        }>;
        remainingBenefits: Record<string, number>;
    }>;
    batchImport(cardData: Array<{
        cardNumber: string;
        type: string;
        memberId: string;
        billingType: 'times' | 'period' | 'unlimited';
        price: number;
        totalSessions?: number;
        validityDays?: number;
    }>, user: User): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    getRevenueStats(startDate: Date, endDate: Date, user: User): Promise<{
        totalRevenue: number;
        cardTypeRevenue: Array<{
            type: string;
            revenue: number;
            count: number;
        }>;
        monthlyRevenue: Array<{
            month: string;
            revenue: number;
        }>;
        renewalRevenue: number;
    }>;
    processExpiredCards(): Promise<{
        processed: number;
        errors: string[];
    }>;
}

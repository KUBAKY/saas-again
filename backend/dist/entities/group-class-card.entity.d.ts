import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { MembershipCard } from './membership-card.entity';
export declare class GroupClassCard extends BaseEntity {
    cardNumber: string;
    type: string;
    price: number;
    totalSessions: number;
    usedSessions: number;
    purchaseDate: Date;
    activationDate?: Date;
    status: 'active' | 'inactive' | 'expired' | 'frozen';
    notes?: string;
    settings?: Record<string, any>;
    memberId: string;
    membershipCardId: string;
    member: Member;
    membershipCard: MembershipCard;
    isActive(): boolean;
    isExpired(): boolean;
    getRemainingTimes(): number;
    canUse(): boolean;
    use(): boolean;
    activate(): void;
    freeze(): void;
    unfreeze(): void;
}

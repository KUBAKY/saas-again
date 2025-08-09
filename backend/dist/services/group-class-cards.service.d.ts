import { Repository } from 'typeorm';
import { GroupClassCard } from '../entities/group-class-card.entity';
import { Member } from '../entities/member.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { User } from '../entities/user.entity';
import { CreateGroupClassCardDto } from '../dto/create-group-class-card.dto';
import { UpdateGroupClassCardDto } from '../dto/update-group-class-card.dto';
import { QueryGroupClassCardDto } from '../dto/query-group-class-card.dto';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class GroupClassCardsService {
    private readonly groupClassCardRepository;
    private readonly memberRepository;
    private readonly membershipCardRepository;
    constructor(groupClassCardRepository: Repository<GroupClassCard>, memberRepository: Repository<Member>, membershipCardRepository: Repository<MembershipCard>);
    create(createDto: CreateGroupClassCardDto, user: User): Promise<GroupClassCard>;
    findAll(queryDto: QueryGroupClassCardDto, user: User): Promise<PaginatedResult<GroupClassCard>>;
    findOne(id: string, user: User): Promise<GroupClassCard>;
    update(id: string, updateDto: UpdateGroupClassCardDto, user: User): Promise<GroupClassCard>;
    remove(id: string, user: User): Promise<void>;
    activate(id: string, user: User): Promise<GroupClassCard>;
    freeze(id: string, user: User): Promise<GroupClassCard>;
    unfreeze(id: string, user: User): Promise<GroupClassCard>;
    useSession(id: string, user: User): Promise<GroupClassCard>;
    expire(id: string, user: User): Promise<GroupClassCard>;
    private generateCardNumber;
}

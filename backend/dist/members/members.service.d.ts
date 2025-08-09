import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateMemberDto, UpdateMemberDto, QueryMemberDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';
export declare class MembersService {
    private readonly memberRepository;
    private readonly storeRepository;
    constructor(memberRepository: Repository<Member>, storeRepository: Repository<Store>);
    create(createMemberDto: CreateMemberDto, currentUser: User): Promise<Member>;
    findAll(queryDto: QueryMemberDto, currentUser: User): Promise<PaginatedResult<Member>>;
    findOne(id: string, currentUser: User): Promise<Member>;
    update(id: string, updateMemberDto: UpdateMemberDto, currentUser: User): Promise<Member>;
    remove(id: string, currentUser: User): Promise<void>;
    getStats(currentUser: User): Promise<{
        totalMembers: number;
        activeMembers: number;
        inactiveMembers: number;
        newMembersThisMonth: number;
        membersByLevel: any;
    } | undefined>;
    private generateMemberNumber;
    private checkStorePermission;
    private getMembersByLevel;
}

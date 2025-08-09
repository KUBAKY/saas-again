import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto, QueryMemberDto } from './dto';
import { User } from '../entities/user.entity';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    create(createMemberDto: CreateMemberDto, user: User): Promise<import("../entities").Member>;
    findAll(queryDto: QueryMemberDto, user: User): Promise<import("../brands/brands.service").PaginatedResult<import("../entities").Member>>;
    getStats(user: User): Promise<{
        totalMembers: number;
        activeMembers: number;
        inactiveMembers: number;
        newMembersThisMonth: number;
        membersByLevel: any;
    } | undefined>;
    findOne(id: string, user: User): Promise<import("../entities").Member>;
    update(id: string, updateMemberDto: UpdateMemberDto, user: User): Promise<import("../entities").Member>;
    remove(id: string, user: User): Promise<void>;
}

import { GroupClassCardsService } from '../services/group-class-cards.service';
import { CreateGroupClassCardDto } from '../dto/create-group-class-card.dto';
import { UpdateGroupClassCardDto } from '../dto/update-group-class-card.dto';
import { QueryGroupClassCardDto } from '../dto/query-group-class-card.dto';
export declare class GroupClassCardsController {
    private readonly groupClassCardsService;
    constructor(groupClassCardsService: GroupClassCardsService);
    create(createDto: CreateGroupClassCardDto, req: any): Promise<import("../entities").GroupClassCard>;
    findAll(query: QueryGroupClassCardDto, req: any): Promise<import("../services/group-class-cards.service").PaginatedResult<import("../entities").GroupClassCard>>;
    findOne(id: string, req: any): Promise<import("../entities").GroupClassCard>;
    update(id: string, updateDto: UpdateGroupClassCardDto, req: any): Promise<import("../entities").GroupClassCard>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    activate(id: string, req: any): Promise<import("../entities").GroupClassCard>;
    freeze(id: string, req: any): Promise<import("../entities").GroupClassCard>;
    unfreeze(id: string, req: any): Promise<import("../entities").GroupClassCard>;
    useSession(id: string, req: any): Promise<import("../entities").GroupClassCard>;
    expire(id: string, req: any): Promise<import("../entities").GroupClassCard>;
}

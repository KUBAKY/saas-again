import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto';
import { User } from '../entities/user.entity';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    create(createStoreDto: CreateStoreDto, user: User): Promise<import("../entities").Store>;
    findAll(queryDto: QueryStoreDto, user: User): Promise<import("../brands/brands.service").PaginatedResult<import("../entities").Store>>;
    findByBrand(brandId: string, user: User): Promise<import("../entities").Store[]>;
    findOne(id: string, user: User): Promise<import("../entities").Store>;
    update(id: string, updateStoreDto: UpdateStoreDto, user: User): Promise<import("../entities").Store>;
    remove(id: string, user: User): Promise<void>;
    getStats(id: string, user: User): Promise<{
        id: string;
        name: string;
        address: string;
        phone: string;
        openTime: string;
        closeTime: string;
        status: "active" | "inactive" | "maintenance";
        createdAt: Date;
        facilities: string[];
        memberCount: number;
        coachCount: number;
        courseCount: number;
    }>;
}

import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto, QueryBrandDto } from './dto';
import { User } from '../entities/user.entity';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    create(createBrandDto: CreateBrandDto, user: User): Promise<import("../entities").Brand>;
    findAll(queryDto: QueryBrandDto, user: User): Promise<import("./brands.service").PaginatedResult<import("../entities").Brand>>;
    findOne(id: string, user: User): Promise<import("../entities").Brand>;
    update(id: string, updateBrandDto: UpdateBrandDto, user: User): Promise<import("../entities").Brand>;
    remove(id: string, user: User): Promise<void>;
    getStats(id: string, user: User): Promise<{
        storeCount: number;
        activeStoreCount: number;
        createdAt: Date;
        status: "active" | "inactive" | "suspended";
    }>;
}

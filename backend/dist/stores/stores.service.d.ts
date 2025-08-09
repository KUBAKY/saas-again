import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';
import { Brand } from '../entities/brand.entity';
import { User } from '../entities/user.entity';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';
export declare class StoresService {
    private readonly storeRepository;
    private readonly brandRepository;
    constructor(storeRepository: Repository<Store>, brandRepository: Repository<Brand>);
    create(createStoreDto: CreateStoreDto, user: User): Promise<Store>;
    findAll(queryDto: QueryStoreDto, user: User): Promise<PaginatedResult<Store>>;
    findOne(id: string, user: User): Promise<Store>;
    update(id: string, updateStoreDto: UpdateStoreDto, user: User): Promise<Store>;
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
    findByBrand(brandId: string, user: User): Promise<Store[]>;
}

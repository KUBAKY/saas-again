import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { User } from '../entities/user.entity';
import { CreateBrandDto, UpdateBrandDto, QueryBrandDto } from './dto';
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class BrandsService {
    private readonly brandRepository;
    constructor(brandRepository: Repository<Brand>);
    create(createBrandDto: CreateBrandDto, user: User): Promise<Brand>;
    findAll(queryDto: QueryBrandDto, user: User): Promise<PaginatedResult<Brand>>;
    findOne(id: string, user: User): Promise<Brand>;
    update(id: string, updateBrandDto: UpdateBrandDto, user: User): Promise<Brand>;
    remove(id: string, user: User): Promise<void>;
    getStats(id: string, user: User): Promise<{
        storeCount: number;
        activeStoreCount: number;
        createdAt: Date;
        status: "active" | "inactive" | "suspended";
    }>;
}

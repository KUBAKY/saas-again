import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateCoachDto, UpdateCoachDto, QueryCoachDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';
export declare class CoachesService {
    private readonly coachRepository;
    private readonly storeRepository;
    constructor(coachRepository: Repository<Coach>, storeRepository: Repository<Store>);
    create(createCoachDto: CreateCoachDto, currentUser: User): Promise<Coach>;
    findAll(queryDto: QueryCoachDto, currentUser: User): Promise<PaginatedResult<Coach>>;
    findOne(id: string, currentUser: User): Promise<Coach>;
    update(id: string, updateCoachDto: UpdateCoachDto, currentUser: User): Promise<Coach>;
    remove(id: string, currentUser: User): Promise<void>;
    getStats(currentUser: User): Promise<{
        totalCoaches: number;
        activeCoaches: number;
        inactiveCoaches: number;
        averageExperience: number;
        coachesBySpecialty: {
            [key: string]: number;
        };
    }>;
    private checkStorePermission;
    private getCoachesBySpecialty;
}

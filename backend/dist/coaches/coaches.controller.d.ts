import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto, QueryCoachDto } from './dto';
import { User } from '../entities/user.entity';
export declare class CoachesController {
    private readonly coachesService;
    constructor(coachesService: CoachesService);
    create(createCoachDto: CreateCoachDto, user: User): Promise<import("../entities").Coach>;
    findAll(queryDto: QueryCoachDto, user: User): Promise<import("../brands/brands.service").PaginatedResult<import("../entities").Coach>>;
    getStats(user: User): Promise<{
        totalCoaches: number;
        activeCoaches: number;
        inactiveCoaches: number;
        averageExperience: number;
        coachesBySpecialty: {
            [key: string]: number;
        };
    }>;
    findOne(id: string, user: User): Promise<import("../entities").Coach>;
    update(id: string, updateCoachDto: UpdateCoachDto, user: User): Promise<import("../entities").Coach>;
    remove(id: string, user: User): Promise<void>;
}

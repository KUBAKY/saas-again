import { PersonalTrainingCardsService } from '../services/personal-training-cards.service';
import { CreatePersonalTrainingCardDto } from '../dto/create-personal-training-card.dto';
import { UpdatePersonalTrainingCardDto } from '../dto/update-personal-training-card.dto';
import { QueryPersonalTrainingCardDto } from '../dto/query-personal-training-card.dto';
export declare class PersonalTrainingCardsController {
    private readonly personalTrainingCardsService;
    constructor(personalTrainingCardsService: PersonalTrainingCardsService);
    create(createDto: CreatePersonalTrainingCardDto, req: any): Promise<import("../entities").PersonalTrainingCard>;
    findAll(query: QueryPersonalTrainingCardDto, req: any): Promise<{
        items: import("../entities").PersonalTrainingCard[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, req: any): Promise<import("../entities").PersonalTrainingCard>;
    update(id: string, updateDto: UpdatePersonalTrainingCardDto, req: any): Promise<import("../entities").PersonalTrainingCard>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    activate(id: string, req: any): Promise<import("../entities").PersonalTrainingCard>;
    freeze(id: string, req: any): Promise<import("../entities").PersonalTrainingCard>;
    unfreeze(id: string, req: any): Promise<import("../entities").PersonalTrainingCard>;
    useSession(id: string, req: any): Promise<import("../entities").PersonalTrainingCard>;
    expire(id: string, req: any): Promise<import("../entities").PersonalTrainingCard>;
}

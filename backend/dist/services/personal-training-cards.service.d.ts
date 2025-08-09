import { Repository } from 'typeorm';
import { PersonalTrainingCard } from '../entities/personal-training-card.entity';
import { Member } from '../entities/member.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { Coach } from '../entities/coach.entity';
import { User } from '../entities/user.entity';
import { CreatePersonalTrainingCardDto } from '../dto/create-personal-training-card.dto';
import { UpdatePersonalTrainingCardDto } from '../dto/update-personal-training-card.dto';
import { QueryPersonalTrainingCardDto } from '../dto/query-personal-training-card.dto';
export declare class PersonalTrainingCardsService {
    private personalTrainingCardRepository;
    private memberRepository;
    private membershipCardRepository;
    private coachRepository;
    constructor(personalTrainingCardRepository: Repository<PersonalTrainingCard>, memberRepository: Repository<Member>, membershipCardRepository: Repository<MembershipCard>, coachRepository: Repository<Coach>);
    create(createDto: CreatePersonalTrainingCardDto, user: User): Promise<PersonalTrainingCard>;
    findAll(query: QueryPersonalTrainingCardDto, user: User): Promise<{
        items: PersonalTrainingCard[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, user: User): Promise<PersonalTrainingCard>;
    update(id: string, updateDto: UpdatePersonalTrainingCardDto, user: User): Promise<PersonalTrainingCard>;
    remove(id: string, user: User): Promise<void>;
    activate(id: string, user: User): Promise<PersonalTrainingCard>;
    freeze(id: string, user: User): Promise<PersonalTrainingCard>;
    unfreeze(id: string, user: User): Promise<PersonalTrainingCard>;
    useSession(id: string, user: User): Promise<PersonalTrainingCard>;
    expire(id: string, user: User): Promise<PersonalTrainingCard>;
    private generateCardNumber;
}

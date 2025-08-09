import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PersonalTrainingCard } from '../entities/personal-training-card.entity';
import { Member } from '../entities/member.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { Coach } from '../entities/coach.entity';
import { User } from '../entities/user.entity';
import { CreatePersonalTrainingCardDto } from '../dto/create-personal-training-card.dto';
import { UpdatePersonalTrainingCardDto } from '../dto/update-personal-training-card.dto';
import { QueryPersonalTrainingCardDto } from '../dto/query-personal-training-card.dto';

@Injectable()
export class PersonalTrainingCardsService {
  constructor(
    @InjectRepository(PersonalTrainingCard)
    private personalTrainingCardRepository: Repository<PersonalTrainingCard>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MembershipCard)
    private membershipCardRepository: Repository<MembershipCard>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async create(
    createDto: CreatePersonalTrainingCardDto,
    user: User,
  ): Promise<PersonalTrainingCard> {
    // 验证会员是否存在且属于当前门店
    const member = await this.memberRepository.findOne({
      where: { id: createDto.memberId },
      relations: ['store'],
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    if (member.store.id !== user.storeId) {
      throw new BadRequestException('无权限操作此会员');
    }

    // 验证会籍卡是否存在且属于该会员
    const membershipCard = await this.membershipCardRepository.findOne({
      where: { id: createDto.membershipCardId },
      relations: ['member', 'member.store'],
    });

    if (!membershipCard) {
      throw new NotFoundException('会籍卡不存在');
    }

    if (membershipCard.member.id !== createDto.memberId) {
      throw new BadRequestException('会籍卡不属于该会员');
    }

    if (membershipCard.member.store.id !== user.storeId) {
      throw new BadRequestException('无权限操作此会籍卡');
    }

    // 验证教练是否存在且属于当前门店
    const coach = await this.coachRepository.findOne({
      where: { id: createDto.coachId },
      relations: ['store'],
    });

    if (!coach) {
      throw new NotFoundException('教练不存在');
    }

    if (coach.store.id !== user.storeId) {
      throw new BadRequestException('无权限操作此教练');
    }

    // 生成卡号
    const cardNumber = await this.generateCardNumber();

    const personalTrainingCard = this.personalTrainingCardRepository.create({
      ...createDto,
      cardNumber,
      member,
      membershipCard,
      coach,
      usedSessions: 0,
      status: 'inactive',
    });

    return await this.personalTrainingCardRepository.save(personalTrainingCard);
  }

  async findAll(query: QueryPersonalTrainingCardDto, user: User) {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.personalTrainingCardRepository
      .createQueryBuilder('card')
      .leftJoinAndSelect('card.member', 'member')
      .leftJoinAndSelect('card.membershipCard', 'membershipCard')
      .leftJoinAndSelect('card.coach', 'coach')
      .leftJoinAndSelect('member.store', 'store')
      .where('store.id = :storeId', { storeId: user.storeId });

    // 应用筛选条件
    if (filters.memberId) {
      queryBuilder.andWhere('member.id = :memberId', {
        memberId: filters.memberId,
      });
    }

    if (filters.membershipCardId) {
      queryBuilder.andWhere('membershipCard.id = :membershipCardId', {
        membershipCardId: filters.membershipCardId,
      });
    }

    if (filters.coachId) {
      queryBuilder.andWhere('coach.id = :coachId', {
        coachId: filters.coachId,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('card.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('card.status = :status', {
        status: filters.status,
      });
    }

    if (filters.purchaseDateStart) {
      queryBuilder.andWhere('card.purchaseDate >= :purchaseDateStart', {
        purchaseDateStart: filters.purchaseDateStart,
      });
    }

    if (filters.purchaseDateEnd) {
      queryBuilder.andWhere('card.purchaseDate <= :purchaseDateEnd', {
        purchaseDateEnd: filters.purchaseDateEnd,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(card.cardNumber LIKE :search OR member.name LIKE :search OR coach.name LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('card.createdAt', 'DESC')
      .getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User): Promise<PersonalTrainingCard> {
    const card = await this.personalTrainingCardRepository.findOne({
      where: { id },
      relations: ['member', 'member.store', 'membershipCard', 'coach'],
    });

    if (!card) {
      throw new NotFoundException('私教卡不存在');
    }

    if (card.member.store.id !== user.storeId) {
      throw new BadRequestException('无权限访问此私教卡');
    }

    return card;
  }

  async update(
    id: string,
    updateDto: UpdatePersonalTrainingCardDto,
    user: User,
  ): Promise<PersonalTrainingCard> {
    const card = await this.findOne(id, user);

    // 如果更新会员，验证新会员
    if (updateDto.memberId && updateDto.memberId !== card.member.id) {
      const member = await this.memberRepository.findOne({
        where: { id: updateDto.memberId },
        relations: ['store'],
      });

      if (!member) {
        throw new NotFoundException('会员不存在');
      }

      if (member.store.id !== user.storeId) {
        throw new BadRequestException('无权限操作此会员');
      }

      card.member = member;
    }

    // 如果更新会籍卡，验证新会籍卡
    if (
      updateDto.membershipCardId &&
      updateDto.membershipCardId !== card.membershipCard.id
    ) {
      const membershipCard = await this.membershipCardRepository.findOne({
        where: { id: updateDto.membershipCardId },
        relations: ['member', 'member.store'],
      });

      if (!membershipCard) {
        throw new NotFoundException('会籍卡不存在');
      }

      const targetMemberId = updateDto.memberId || card.member.id;
      if (membershipCard.member.id !== targetMemberId) {
        throw new BadRequestException('会籍卡不属于该会员');
      }

      if (membershipCard.member.store.id !== user.storeId) {
        throw new BadRequestException('无权限操作此会籍卡');
      }

      card.membershipCard = membershipCard;
    }

    // 如果更新教练，验证新教练
    if (updateDto.coachId && updateDto.coachId !== card.coach?.id) {
      const coach = await this.coachRepository.findOne({
        where: { id: updateDto.coachId },
        relations: ['store'],
      });

      if (!coach) {
        throw new NotFoundException('教练不存在');
      }

      if (coach.store.id !== user.storeId) {
        throw new BadRequestException('无权限操作此教练');
      }

      card.coach = coach;
    }

    // 更新其他字段
    Object.assign(card, updateDto);

    return await this.personalTrainingCardRepository.save(card);
  }

  async remove(id: string, user: User): Promise<void> {
    const card = await this.findOne(id, user);
    await this.personalTrainingCardRepository.remove(card);
  }

  async activate(id: string, user: User): Promise<PersonalTrainingCard> {
    const card = await this.findOne(id, user);
    card.activate();
    return await this.personalTrainingCardRepository.save(card);
  }

  async freeze(id: string, user: User): Promise<PersonalTrainingCard> {
    const card = await this.findOne(id, user);
    card.freeze();
    return await this.personalTrainingCardRepository.save(card);
  }

  async unfreeze(id: string, user: User): Promise<PersonalTrainingCard> {
    const card = await this.findOne(id, user);
    card.unfreeze();
    return await this.personalTrainingCardRepository.save(card);
  }

  async useSession(id: string, user: User): Promise<PersonalTrainingCard> {
    const card = await this.findOne(id, user);
    if (!card.use()) {
      throw new BadRequestException('私教卡无法使用');
    }
    return await this.personalTrainingCardRepository.save(card);
  }

  async expire(id: string, user: User): Promise<PersonalTrainingCard> {
    const card = await this.findOne(id, user);
    card.status = 'expired';
    return await this.personalTrainingCardRepository.save(card);
  }

  private async generateCardNumber(): Promise<string> {
    const prefix = 'PT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}

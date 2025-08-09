import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { GroupClassCard } from '../entities/group-class-card.entity';
import { Member } from '../entities/member.entity';
import { MembershipCard } from '../entities/membership-card.entity';
import { User } from '../entities/user.entity';
import { CreateGroupClassCardDto } from '../dto/create-group-class-card.dto';
import { UpdateGroupClassCardDto } from '../dto/update-group-class-card.dto';
import { QueryGroupClassCardDto } from '../dto/query-group-class-card.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GroupClassCardsService {
  constructor(
    @InjectRepository(GroupClassCard)
    private readonly groupClassCardRepository: Repository<GroupClassCard>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(MembershipCard)
    private readonly membershipCardRepository: Repository<MembershipCard>,
  ) {}

  async create(
    createDto: CreateGroupClassCardDto,
    user: User,
  ): Promise<GroupClassCard> {
    // 验证会员是否存在
    const member = await this.memberRepository.findOne({
      where: { id: createDto.memberId },
      relations: ['store'],
    });
    if (!member || member.store?.id !== user.storeId) {
      throw new NotFoundException('会员不存在');
    }

    // 验证会籍卡是否存在且有效
    const membershipCard = await this.membershipCardRepository.findOne({
      where: { 
        id: createDto.membershipCardId, 
        memberId: createDto.memberId,
      },
      relations: ['member', 'member.store'],
    });
    if (!membershipCard || membershipCard.member?.store?.id !== user.storeId) {
      throw new NotFoundException('会籍卡不存在');
    }

    if (!membershipCard.isActive()) {
      throw new BadRequestException('会籍卡未激活或已过期，无法购买团课卡');
    }

    // 生成卡号
    const cardNumber = await this.generateCardNumber();

    const groupClassCard = this.groupClassCardRepository.create({
      ...createDto,
      cardNumber,
      purchaseDate: createDto.purchaseDate ? new Date(createDto.purchaseDate) : new Date(),
      usedSessions: 0,
      status: 'inactive',
    });

    return await this.groupClassCardRepository.save(groupClassCard);
  }

  async findAll(
    queryDto: QueryGroupClassCardDto,
    user: User,
  ): Promise<PaginatedResult<GroupClassCard>> {
    const {
      page = 1,
      limit = 20,
      memberId,
      membershipCardId,
      type,
      status,
      purchaseDateStart,
      purchaseDateEnd,
      search,
    } = queryDto;

    const where: FindOptionsWhere<GroupClassCard> = {};

    if (memberId) where.memberId = memberId;
    if (membershipCardId) where.membershipCardId = membershipCardId;
    if (type) where.type = Like(`%${type}%`);
    if (status) where.status = status;

    if (purchaseDateStart && purchaseDateEnd) {
      where.purchaseDate = Between(new Date(purchaseDateStart), new Date(purchaseDateEnd));
    } else if (purchaseDateStart) {
      where.purchaseDate = MoreThanOrEqual(new Date(purchaseDateStart));
    } else if (purchaseDateEnd) {
      where.purchaseDate = LessThanOrEqual(new Date(purchaseDateEnd));
    }

    const options: FindManyOptions<GroupClassCard> = {
      where,
      relations: ['member', 'membershipCard', 'member.store'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    if (search) {
      options.where = [
        { ...where, cardNumber: Like(`%${search}%`) },
        { ...where, type: Like(`%${search}%`) },
      ];
    }

    // 获取数据
    const [allCards, allTotal] = await this.groupClassCardRepository.findAndCount({
      where: options.where,
      relations: ['member', 'member.store', 'membershipCard'],
      order: { createdAt: 'DESC' },
    });

    // 过滤属于当前门店的数据
    const filteredCards = allCards.filter(card => card.member.store.id === user.storeId);
    
    // 应用分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCards = filteredCards.slice(startIndex, endIndex);
    const filteredTotal = filteredCards.length;

    return {
      data: paginatedCards,
      total: filteredTotal,
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
    };
  }

  async findOne(id: string, user: User): Promise<GroupClassCard> {
    const card = await this.groupClassCardRepository.findOne({
      where: { id },
      relations: ['member', 'membershipCard', 'member.store'],
    });

    if (!card || card.member?.store?.id !== user.storeId) {
      throw new NotFoundException('团课卡不存在');
    }

    return card;
  }

  async update(
    id: string,
    updateDto: UpdateGroupClassCardDto,
    user: User,
  ): Promise<GroupClassCard> {
    const card = await this.findOne(id, user);

    // 如果更新会员或会籍卡，需要验证
    if (updateDto.memberId && updateDto.memberId !== card.memberId) {
      const member = await this.memberRepository.findOne({
        where: { id: updateDto.memberId },
        relations: ['store'],
      });
      if (!member || member.store?.id !== user.storeId) {
        throw new NotFoundException('会员不存在');
      }
    }

    if (updateDto.membershipCardId && updateDto.membershipCardId !== card.membershipCardId) {
      const membershipCard = await this.membershipCardRepository.findOne({
        where: { 
          id: updateDto.membershipCardId, 
          memberId: updateDto.memberId || card.memberId,
        },
        relations: ['member', 'member.store'],
      });
      if (!membershipCard || membershipCard.member?.store?.id !== user.storeId) {
        throw new NotFoundException('会籍卡不存在');
      }
    }

    Object.assign(card, updateDto);
    return await this.groupClassCardRepository.save(card);
  }

  async remove(id: string, user: User): Promise<void> {
    const card = await this.findOne(id, user);
    
    if (card.status === 'active' && card.usedSessions > 0) {
      throw new BadRequestException('已使用的团课卡不能删除，请先退款');
    }

    await this.groupClassCardRepository.softDelete(id);
  }

  async activate(id: string, user: User): Promise<GroupClassCard> {
    const card = await this.findOne(id, user);
    
    if (card.status !== 'inactive') {
      throw new BadRequestException('只有未激活的团课卡才能激活');
    }

    // 检查会籍卡是否仍然有效
    const membershipCard = await this.membershipCardRepository.findOne({
      where: { id: card.membershipCardId },
    });

    if (!membershipCard || !membershipCard.isActive()) {
      throw new BadRequestException('会籍卡已过期，无法激活团课卡');
    }

    card.activate();
    return await this.groupClassCardRepository.save(card);
  }

  async freeze(id: string, user: User): Promise<GroupClassCard> {
    const card = await this.findOne(id, user);
    card.freeze();
    return await this.groupClassCardRepository.save(card);
  }

  async unfreeze(id: string, user: User): Promise<GroupClassCard> {
    const card = await this.findOne(id, user);
    card.unfreeze();
    return await this.groupClassCardRepository.save(card);
  }

  async useSession(id: string, user: User): Promise<GroupClassCard> {
    const card = await this.findOne(id, user);
    if (!card.use()) {
      throw new BadRequestException('团课卡无法使用');
    }
    return await this.groupClassCardRepository.save(card);
  }

  async expire(id: string, user: User): Promise<GroupClassCard> {
    const card = await this.findOne(id, user);
    card.status = 'expired';
    return await this.groupClassCardRepository.save(card);
  }

  private async generateCardNumber(): Promise<string> {
    const prefix = 'GCC';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}
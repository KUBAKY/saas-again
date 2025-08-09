import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipCard } from '../entities/membership-card.entity';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import {
  CreateMembershipCardDto,
  UpdateMembershipCardDto,
  QueryMembershipCardDto,
} from './dto';
import { checkPermission } from '../common/utils/permission.util';

@Injectable()
export class MembershipCardsService {
  constructor(
    @InjectRepository(MembershipCard)
    private membershipCardRepository: Repository<MembershipCard>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(createMembershipCardDto: CreateMembershipCardDto, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'create');

    // 验证会员是否存在
    const member = await this.memberRepository.findOne({
      where: { id: createMembershipCardDto.memberId },
      relations: ['store'],
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    const membershipCard = this.membershipCardRepository.create({
      ...createMembershipCardDto,
      member,
      createdBy: user.id,
    });

    return await this.membershipCardRepository.save(membershipCard);
  }

  async findAll(queryDto: QueryMembershipCardDto, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const {
      page = 1,
      limit = 10,
      memberId,
      cardType,
      status,
      storeId,
    } = queryDto;

    const queryBuilder = this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .leftJoinAndSelect('membershipCard.member', 'member')
      .where('membershipCard.brandId = :brandId', { brandId: user.brandId });

    if (user.storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', {
        storeId: user.storeId,
      });
    } else if (storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', { storeId });
    }

    if (memberId) {
      queryBuilder.andWhere('membershipCard.memberId = :memberId', {
        memberId,
      });
    }

    if (cardType) {
      queryBuilder.andWhere('membershipCard.cardType = :cardType', {
        cardType,
      });
    }

    if (status) {
      queryBuilder.andWhere('membershipCard.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .orderBy('membershipCard.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const queryBuilder = this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .leftJoinAndSelect('membershipCard.member', 'member')
      .where('membershipCard.id = :id', { id })
      .andWhere('membershipCard.brandId = :brandId', { brandId: user.brandId });

    if (user.storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', {
        storeId: user.storeId,
      });
    }

    const membershipCard = await queryBuilder.getOne();

    if (!membershipCard) {
      throw new NotFoundException('会员卡不存在');
    }

    return membershipCard;
  }

  async update(
    id: string,
    updateMembershipCardDto: UpdateMembershipCardDto,
    user: User,
  ) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(id, user);

    Object.assign(membershipCard, updateMembershipCardDto);
    membershipCard.updatedBy = user.id;

    return await this.membershipCardRepository.save(membershipCard);
  }

  async activate(id: string, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(id, user);

    if (membershipCard.status !== 'inactive') {
      throw new BadRequestException('只有未激活的会员卡才能激活');
    }

    membershipCard.activate();

    return await this.membershipCardRepository.save(membershipCard);
  }

  async suspend(id: string, reason: string, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(id, user);

    if (membershipCard.status === 'frozen') {
      throw new BadRequestException('会员卡已经冻结');
    }

    if (membershipCard.status !== 'active') {
      throw new BadRequestException('只有激活的会员卡才能暂停');
    }

    membershipCard.freeze();
    membershipCard.notes = reason
      ? `冻结原因: ${reason}`
      : membershipCard.notes;

    return await this.membershipCardRepository.save(membershipCard);
  }

  async renew(id: string, renewalPeriod: number, amount: number, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(id, user);

    // 计算新的到期时间
    const currentExpiry = membershipCard.expiryDate || new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + renewalPeriod);

    membershipCard.expiryDate = newExpiry;
    membershipCard.status = 'active';
    membershipCard.updatedBy = user.id;

    return await this.membershipCardRepository.save(membershipCard);
  }

  async remove(id: string, user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'delete');

    const membershipCard = await this.findOne(id, user);
    return await this.membershipCardRepository.remove(membershipCard);
  }

  async getStats(user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const queryBuilder = this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .where('membershipCard.brandId = :brandId', { brandId: user.brandId });

    if (user.storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', {
        storeId: user.storeId,
      });
    }

    const [total, active, expired, suspended] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder
        .clone()
        .andWhere('membershipCard.status = :status', { status: 'active' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('membershipCard.status = :status', { status: 'expired' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('membershipCard.status = :status', { status: 'suspended' })
        .getCount(),
    ]);

    return {
      total,
      active,
      expired,
      suspended,
    };
  }
}

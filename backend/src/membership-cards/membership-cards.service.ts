import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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

  /**
   * 验证会员卡权益
   */
  async validateBenefit(
    cardId: string,
    benefitType: string,
    user: User,
  ): Promise<{ valid: boolean; message?: string; discount?: number }> {
    const membershipCard = await this.findOne(cardId, user);

    if (membershipCard.status !== 'active') {
      return { valid: false, message: '会员卡未激活或已过期' };
    }

    if (membershipCard.expiryDate && membershipCard.expiryDate < new Date()) {
      return { valid: false, message: '会员卡已过期' };
    }

    const benefits = membershipCard.benefits || {};
    const benefit = benefits[benefitType];

    if (!benefit) {
      return { valid: false, message: '该会员卡不包含此权益' };
    }

    // 检查使用次数限制
    if (benefit.usageLimit && benefit.usedCount >= benefit.usageLimit) {
      return { valid: false, message: '权益使用次数已达上限' };
    }

    return {
      valid: true,
      discount: benefit.discount,
    };
  }

  /**
   * 使用会员卡权益
   */
  async useBenefit(
    cardId: string,
    benefitType: string,
    user: User,
  ): Promise<MembershipCard> {
    const validation = await this.validateBenefit(cardId, benefitType, user);

    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const membershipCard = await this.findOne(cardId, user);
    const benefits = membershipCard.benefits || {
      discountRate: 0,
      freeServices: [],
      priorityBooking: false,
      guestPasses: 0,
      personalTrainingDiscount: 0,
      groupClassDiscount: 0,
      additionalBenefits: {},
    };

    if (benefits[benefitType]) {
      (benefits[benefitType] as any).usedCount =
        ((benefits[benefitType] as any).usedCount || 0) + 1;
      membershipCard.benefits = benefits;
      membershipCard.updatedBy = user.id;
    }

    return await this.membershipCardRepository.save(membershipCard);
  }

  /**
   * 获取会员卡使用记录
   */
  async getUsageHistory(
    cardId: string,
    user: User,
  ): Promise<
    { benefitType: string; usedCount: number; usageLimit?: number }[]
  > {
    const membershipCard = await this.findOne(cardId, user);
    const benefits = membershipCard.benefits || {};

    return Object.entries(benefits).map(([benefitType, benefit]) => ({
      benefitType,
      usedCount: (benefit as any)?.usedCount || 0,
      usageLimit: (benefit as any)?.usageLimit,
    }));
  }

  /**
   * 获取即将到期的会员卡
   */
  async getExpiringCards(
    days: number = 30,
    user: User,
  ): Promise<MembershipCard[]> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const queryBuilder = this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .leftJoinAndSelect('membershipCard.member', 'member')
      .where('membershipCard.brandId = :brandId', { brandId: user.brandId })
      .andWhere('membershipCard.status = :status', { status: 'active' })
      .andWhere('membershipCard.expiryDate <= :expiryDate', { expiryDate })
      .andWhere('membershipCard.expiryDate > :now', { now: new Date() });

    if (user.storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', {
        storeId: user.storeId,
      });
    }

    return await queryBuilder
      .orderBy('membershipCard.expiryDate', 'ASC')
      .getMany();
  }

  /**
   * 批量续费会员卡
   */
  async batchRenew(
    cardIds: string[],
    renewalPeriod: number,
    amount: number,
    user: User,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const cardId of cardIds) {
      try {
        await this.renew(cardId, renewalPeriod, amount, user);
        success++;
      } catch (error) {
        failed++;
        errors.push(`卡片 ${cardId}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * 获取会员卡类型统计
   */
  async getCardTypeStats(user: User) {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const queryBuilder = this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .select('membershipCard.cardType', 'cardType')
      .addSelect('COUNT(*)', 'count')
      .where('membershipCard.brandId = :brandId', { brandId: user.brandId })
      .groupBy('membershipCard.cardType');

    if (user.storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', {
        storeId: user.storeId,
      });
    }

    const results = await queryBuilder.getRawMany();

    return results.map((result) => ({
      cardType: result.cardType,
      count: parseInt(result.count),
    }));
  }

  /**
   * 会员卡转移
   */
  async transferCard(
    cardId: string,
    newMemberId: string,
    reason: string,
    user: User,
  ): Promise<MembershipCard> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(cardId, user);

    // 验证新会员是否存在
    const newMember = await this.memberRepository.findOne({
      where: { id: newMemberId },
    });

    if (!newMember) {
      throw new NotFoundException('目标会员不存在');
    }

    // 检查会员卡状态
    if (membershipCard.status !== 'active') {
      throw new BadRequestException('只能转移激活状态的会员卡');
    }

    // 记录转移信息
    const transferNote = `转移给会员: ${newMember.name} (${newMember.phone}), 原因: ${reason}`;

    membershipCard.memberId = newMemberId;
    membershipCard.member = newMember;
    membershipCard.notes = `${membershipCard.notes || ''}\n${transferNote}`;
    membershipCard.updatedBy = user.id;
    membershipCard.updatedAt = new Date();

    return await this.membershipCardRepository.save(membershipCard);
  }

  /**
   * 冻结会员卡
   */
  async freezeCard(
    cardId: string,
    freezeDays: number,
    reason: string,
    user: User,
  ): Promise<MembershipCard> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(cardId, user);

    if (membershipCard.status !== 'active') {
      throw new BadRequestException('只能冻结激活状态的会员卡');
    }

    // 延长到期时间
    if (membershipCard.expiryDate) {
      const newExpiryDate = new Date(membershipCard.expiryDate);
      newExpiryDate.setDate(newExpiryDate.getDate() + freezeDays);
      membershipCard.expiryDate = newExpiryDate;
    }

    membershipCard.status = 'frozen';
    membershipCard.notes = `${membershipCard.notes || ''}\n冻结 ${freezeDays} 天，原因: ${reason}`;
    membershipCard.updatedBy = user.id;
    membershipCard.updatedAt = new Date();

    return await this.membershipCardRepository.save(membershipCard);
  }

  /**
   * 解冻会员卡
   */
  async unfreezeCard(cardId: string, user: User): Promise<MembershipCard> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(cardId, user);

    if (membershipCard.status !== 'frozen') {
      throw new BadRequestException('只能解冻冻结状态的会员卡');
    }

    membershipCard.status = 'active';
    membershipCard.notes = `${membershipCard.notes || ''}\n解冻操作`;
    membershipCard.updatedBy = user.id;
    membershipCard.updatedAt = new Date();

    return await this.membershipCardRepository.save(membershipCard);
  }

  /**
   * 升级会员卡权益
   */
  async upgradeBenefits(
    cardId: string,
    newBenefits: Partial<MembershipCard['benefits']>,
    additionalFee: number,
    user: User,
  ): Promise<MembershipCard> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'update');

    const membershipCard = await this.findOne(cardId, user);

    if (membershipCard.status !== 'active') {
      throw new BadRequestException('只能升级激活状态的会员卡');
    }

    // 合并权益配置
    const currentBenefits = membershipCard.benefits || {
      discountRate: 0,
      freeServices: [],
      priorityBooking: false,
      guestPasses: 0,
      personalTrainingDiscount: 0,
      groupClassDiscount: 0,
      additionalBenefits: {},
    };

    membershipCard.benefits = {
      ...currentBenefits,
      ...(newBenefits || {}),
      additionalBenefits: {
        ...currentBenefits.additionalBenefits,
        ...(newBenefits?.additionalBenefits || {}),
      },
    };

    membershipCard.price = Number(membershipCard.price) + additionalFee;
    membershipCard.notes = `${membershipCard.notes || ''}\n权益升级，补缴费用: ${additionalFee}元`;
    membershipCard.updatedBy = user.id;
    membershipCard.updatedAt = new Date();

    return await this.membershipCardRepository.save(membershipCard);
  }

  /**
   * 获取会员卡使用分析
   */
  async getUsageAnalytics(
    cardId: string,
    startDate: Date,
    endDate: Date,
    user: User,
  ): Promise<{
    totalUsage: number;
    benefitUsage: Record<string, number>;
    usageByDate: Array<{ date: string; count: number }>;
    remainingBenefits: Record<string, number>;
  }> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const membershipCard = await this.findOne(cardId, user);
    const benefits = membershipCard.benefits || {};

    // 计算权益使用情况
    const benefitUsage: Record<string, number> = {};
    const remainingBenefits: Record<string, number> = {};
    let totalUsage = 0;

    Object.entries(benefits).forEach(([benefitType, benefit]) => {
      if (typeof benefit === 'object' && benefit !== null) {
        const usedCount = (benefit as any).usedCount || 0;
        const usageLimit = (benefit as any).usageLimit;

        benefitUsage[benefitType] = usedCount;
        totalUsage += usedCount;

        if (usageLimit) {
          remainingBenefits[benefitType] = Math.max(0, usageLimit - usedCount);
        }
      }
    });

    // 模拟按日期的使用统计（实际应该从使用记录表获取）
    const usageByDate: Array<{ date: string; count: number }> = [];
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      usageByDate.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 3), // 模拟数据，实际应从数据库查询
      });
    }

    return {
      totalUsage,
      benefitUsage,
      usageByDate,
      remainingBenefits,
    };
  }

  /**
   * 批量导入会员卡
   */
  async batchImport(
    cardData: Array<{
      cardNumber: string;
      type: string;
      memberId: string;
      billingType: 'times' | 'period' | 'unlimited';
      price: number;
      totalSessions?: number;
      validityDays?: number;
    }>,
    user: User,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'create');

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const data of cardData) {
      try {
        // 检查卡号是否已存在
        const existing = await this.membershipCardRepository.findOne({
          where: { cardNumber: data.cardNumber },
        });

        if (existing) {
          throw new Error(`卡号 ${data.cardNumber} 已存在`);
        }

        // 验证会员是否存在
        const member = await this.memberRepository.findOne({
          where: { id: data.memberId },
        });

        if (!member) {
          throw new Error(`会员ID ${data.memberId} 不存在`);
        }

        const issueDate = new Date();
        const expiryDate = data.validityDays
          ? new Date(
              issueDate.getTime() + data.validityDays * 24 * 60 * 60 * 1000,
            )
          : undefined;

        const membershipCard = this.membershipCardRepository.create({
          cardNumber: data.cardNumber,
          type: data.type,
          billingType: data.billingType,
          price: data.price,
          totalSessions: data.totalSessions,
          validityDays: data.validityDays,
          issueDate,
          expiryDate,
          memberId: data.memberId,
          member,
          status: 'inactive',
          createdBy: user.id,
        });

        await this.membershipCardRepository.save(membershipCard);
        success++;
      } catch (error) {
        failed++;
        errors.push(`卡号 ${data.cardNumber}: ${error.message}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * 获取会员卡收入统计
   */
  async getRevenueStats(
    startDate: Date,
    endDate: Date,
    user: User,
  ): Promise<{
    totalRevenue: number;
    cardTypeRevenue: Array<{ type: string; revenue: number; count: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    renewalRevenue: number;
  }> {
    checkPermission(user.roles?.[0]?.name || '', 'membership-card', 'read');

    const queryBuilder = this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .where('membershipCard.brandId = :brandId', { brandId: user.brandId })
      .andWhere('membershipCard.issueDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (user.storeId) {
      queryBuilder.andWhere('membershipCard.storeId = :storeId', {
        storeId: user.storeId,
      });
    }

    const cards = await queryBuilder.getMany();

    // 计算总收入
    const totalRevenue = cards.reduce(
      (sum, card) => sum + Number(card.price),
      0,
    );

    // 按卡类型统计收入
    const cardTypeStats = new Map<string, { revenue: number; count: number }>();
    cards.forEach((card) => {
      const existing = cardTypeStats.get(card.type) || { revenue: 0, count: 0 };
      existing.revenue += Number(card.price);
      existing.count += 1;
      cardTypeStats.set(card.type, existing);
    });

    const cardTypeRevenue = Array.from(cardTypeStats.entries()).map(
      ([type, stats]) => ({
        type,
        revenue: stats.revenue,
        count: stats.count,
      }),
    );

    // 按月统计收入
    const monthlyStats = new Map<string, number>();
    cards.forEach((card) => {
      const month = card.issueDate.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyStats.get(month) || 0;
      monthlyStats.set(month, existing + Number(card.price));
    });

    const monthlyRevenue = Array.from(monthlyStats.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 续费收入（简化计算，实际应该有专门的续费记录）
    const renewalRevenue = cards
      .filter((card) => card.notes?.includes('续费'))
      .reduce((sum, card) => sum + Number(card.price), 0);

    return {
      totalRevenue,
      cardTypeRevenue,
      monthlyRevenue,
      renewalRevenue,
    };
  }

  /**
   * 自动处理过期会员卡
   */
  async processExpiredCards(): Promise<{
    processed: number;
    errors: string[];
  }> {
    const now = new Date();
    const expiredCards = await this.membershipCardRepository
      .createQueryBuilder('membershipCard')
      .where('membershipCard.status = :status', { status: 'active' })
      .andWhere('membershipCard.expiryDate < :now', { now })
      .getMany();

    let processed = 0;
    const errors: string[] = [];

    for (const card of expiredCards) {
      try {
        card.status = 'expired';
        card.notes = `${card.notes || ''}\n系统自动标记为过期`;
        card.updatedAt = now;
        await this.membershipCardRepository.save(card);
        processed++;
      } catch (error) {
        errors.push(`处理卡片 ${card.cardNumber} 失败: ${error.message}`);
      }
    }

    return { processed, errors };
  }
}

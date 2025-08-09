import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Like,
  FindManyOptions,
  FindOptionsWhere,
  Between,
} from 'typeorm';
import { Member } from '../entities/member.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateMemberDto, UpdateMemberDto, QueryMemberDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(
    createMemberDto: CreateMemberDto,
    currentUser: User,
  ): Promise<Member> {
    const { storeId, phone } = createMemberDto;

    // 验证门店是否存在且用户有权限
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
      relations: ['brand'],
    });

    if (!store) {
      throw new BadRequestException('门店不存在');
    }

    // 权限检查
    const canCreate = this.checkStorePermission(
      currentUser,
      store.brandId,
      storeId,
    );
    if (!canCreate) {
      throw new ForbiddenException('无权限在此门店创建会员');
    }

    // 检查手机号在门店内是否已存在
    const existingMember = await this.memberRepository.findOne({
      where: { phone, storeId },
    });

    if (existingMember) {
      throw new ConflictException('该手机号在此门店已注册');
    }

    // 生成会员号
    const memberNumber = await this.generateMemberNumber();

    const member = this.memberRepository.create({
      ...createMemberDto,
      memberNumber,
      status: 'active',
      points: 0,
    });

    return await this.memberRepository.save(member);
  }

  async findAll(
    queryDto: QueryMemberDto,
    currentUser: User,
  ): Promise<PaginatedResult<Member>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      storeId,
      level,
      gender,
      minAge,
      maxAge,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    // 构建查询条件
    const where: FindOptionsWhere<Member> = {};

    if (search) {
      // 可以搜索姓名、手机号、会员号
      where.name = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    if (level) {
      where.level = level;
    }

    if (gender) {
      where.gender = gender;
    }

    // 年龄过滤在查询构建器中处理
    // TypeORM的FindOptionsWhere不支持复杂的日期计算

    // 权限控制：根据用户角色限制查询范围
    if (currentUser.roles?.some((role) => role.name === 'ADMIN')) {
      // 系统管理员可以查看所有会员
      if (storeId) {
        where.storeId = storeId;
      }
    } else if (
      currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER')
    ) {
      // 品牌管理员只能查看自己品牌的会员
      // 需要通过store表来过滤brandId
      const stores = await this.storeRepository.find({
        where: { brandId: currentUser.brandId },
        select: ['id'],
      });
      const storeIds = stores.map((s) => s.id);

      if (storeId && storeIds.includes(storeId)) {
        where.storeId = storeId;
      } else {
        // 如果没有指定storeId或指定的storeId不在权限范围内，返回品牌下所有门店的会员
        // 这里需要使用IN查询，但TypeORM的FindOptionsWhere不直接支持，我们在后面处理
      }
    } else {
      // 门店管理员和其他角色只能查看自己门店的会员
      if (currentUser.storeId) {
        where.storeId = currentUser.storeId;
      }
    }

    let findOptions: FindManyOptions<Member>;

    // 处理品牌管理员的多门店查询
    if (
      currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER') &&
      !storeId
    ) {
      const stores = await this.storeRepository.find({
        where: { brandId: currentUser.brandId },
        select: ['id'],
      });
      const storeIds = stores.map((s) => s.id);

      findOptions = {
        where: {
          ...where,
          storeId: storeIds.length > 0 ? storeIds[0] : undefined, // TypeORM limitation workaround
        },
        order: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['store'],
      };

      // 使用query builder处理IN查询
      const queryBuilder = this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.store', 'store')
        .where('member.storeId IN (:...storeIds)', { storeIds })
        .orderBy(`member.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        queryBuilder.andWhere('member.name LIKE :search', {
          search: `%${search}%`,
        });
      }
      if (status) {
        queryBuilder.andWhere('member.status = :status', { status });
      }
      if (level) {
        queryBuilder.andWhere('member.level = :level', { level });
      }
      if (gender) {
        queryBuilder.andWhere('member.gender = :gender', { gender });
      }

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      findOptions = {
        where,
        order: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['store'],
      };

      const [data, total] =
        await this.memberRepository.findAndCount(findOptions);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  }

  async findOne(id: string, currentUser: User): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['store', 'store.brand'],
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    // 权限检查
    const canView = this.checkStorePermission(
      currentUser,
      member.store.brandId,
      member.storeId,
    );
    if (!canView) {
      throw new ForbiddenException('无权限查看此会员');
    }

    return member;
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
    currentUser: User,
  ): Promise<Member> {
    const member = await this.findOne(id, currentUser);

    // 权限检查
    const canUpdate = this.checkStorePermission(
      currentUser,
      member.store.brandId,
      member.storeId,
    );
    if (!canUpdate) {
      throw new ForbiddenException('无权限更新此会员');
    }

    // 如果更新手机号，检查是否在门店内已被使用
    if (updateMemberDto.phone && updateMemberDto.phone !== member.phone) {
      const existingMember = await this.memberRepository.findOne({
        where: { phone: updateMemberDto.phone, storeId: member.storeId },
      });

      if (existingMember) {
        throw new ConflictException('该手机号在此门店已被使用');
      }
    }

    Object.assign(member, updateMemberDto);
    member.updatedAt = new Date();

    return await this.memberRepository.save(member);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const member = await this.findOne(id, currentUser);

    // 权限检查：只有系统管理员和品牌管理员可以删除会员
    const canDelete = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' &&
          currentUser.brandId === member.store.brandId),
    );

    if (!canDelete) {
      throw new ForbiddenException('无权限删除此会员');
    }

    // 软删除
    member.status = 'inactive';
    member.deletedAt = new Date();
    await this.memberRepository.save(member);
  }

  async getStats(currentUser: User) {
    // 根据用户权限获取统计信息
    let whereCondition = {};

    if (currentUser.roles?.some((role) => role.name === 'ADMIN')) {
      // 系统管理员可以查看全部统计
    } else if (
      currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER')
    ) {
      // 品牌管理员查看自己品牌的统计
      const stores = await this.storeRepository.find({
        where: { brandId: currentUser.brandId },
        select: ['id'],
      });
      const storeIds = stores.map((s) => s.id);

      const totalMembers = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.storeId IN (:...storeIds)', { storeIds })
        .getCount();

      const activeMembers = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.storeId IN (:...storeIds)', { storeIds })
        .andWhere('member.status = :status', { status: 'active' })
        .getCount();

      const newMembersThisMonth = await this.memberRepository
        .createQueryBuilder('member')
        .where('member.storeId IN (:...storeIds)', { storeIds })
        .andWhere('member.createdAt >= :startDate', {
          startDate: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ),
        })
        .getCount();

      return {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
        newMembersThisMonth,
        membersByLevel: await this.getMembersByLevel(storeIds),
      };
    } else {
      // 门店级别统计
      whereCondition = { storeId: currentUser.storeId };

      const totalMembers = await this.memberRepository.count({
        where: whereCondition,
      });
      const activeMembers = await this.memberRepository.count({
        where: { ...whereCondition, status: 'active' },
      });
      const newMembersThisMonth = await this.memberRepository.count({
        where: {
          ...whereCondition,
          createdAt: Between(
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            new Date(),
          ),
        },
      });

      return {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
        newMembersThisMonth,
        membersByLevel: await this.getMembersByLevel([currentUser.storeId!]),
      };
    }
  }

  private async generateMemberNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.memberRepository.count();
    return `M${year}${(count + 1).toString().padStart(6, '0')}`;
  }

  private checkStorePermission(
    user: User,
    brandId: string,
    storeId: string,
  ): boolean {
    return (
      user.roles?.some(
        (role) =>
          role.name === 'ADMIN' ||
          (role.name === 'BRAND_MANAGER' && user.brandId === brandId) ||
          (user.brandId === brandId &&
            (!user.storeId || user.storeId === storeId)),
      ) || false
    );
  }

  private async getMembersByLevel(storeIds: string[]) {
    const result = await this.memberRepository
      .createQueryBuilder('member')
      .select('member.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('member.storeId IN (:...storeIds)', { storeIds })
      .groupBy('member.level')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.level] = parseInt(item.count);
      return acc;
    }, {});
  }
}

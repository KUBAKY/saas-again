import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { Store } from '../entities/store.entity';
import { User } from '../entities/user.entity';
import { CreateCoachDto, UpdateCoachDto, QueryCoachDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';

@Injectable()
export class CoachesService {
  constructor(
    @InjectRepository(Coach)
    private readonly coachRepository: Repository<Coach>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(
    createCoachDto: CreateCoachDto,
    currentUser: User,
  ): Promise<Coach> {
    const { storeId, employeeNumber, phone, email } = createCoachDto;

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
      throw new ForbiddenException('无权限在此门店创建教练');
    }

    // 检查员工编号是否已存在
    const existingCoachByNumber = await this.coachRepository.findOne({
      where: { employeeNumber },
    });

    if (existingCoachByNumber) {
      throw new ConflictException('员工编号已存在');
    }

    // 检查手机号在门店内是否已存在
    const existingCoachByPhone = await this.coachRepository.findOne({
      where: { phone, storeId },
    });

    if (existingCoachByPhone) {
      throw new ConflictException('该手机号在此门店已被使用');
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingCoachByEmail = await this.coachRepository.findOne({
        where: { email },
      });

      if (existingCoachByEmail) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    const coach = this.coachRepository.create({
      ...createCoachDto,
      status: 'active',
      // 如果提供了certifications，转换为实体需要的格式
      certifications: createCoachDto.certifications?.map((cert) => ({
        name: cert,
        issuer: '待完善',
        issueDate: new Date().toISOString().split('T')[0],
      })),
    });

    return await this.coachRepository.save(coach);
  }

  async findAll(
    queryDto: QueryCoachDto,
    currentUser: User,
  ): Promise<PaginatedResult<Coach>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      storeId,
      gender,
      specialty,
      minExperience,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    // 构建查询条件
    const where: FindOptionsWhere<Coach> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    if (gender) {
      where.gender = gender;
    }

    if (minExperience) {
      // TypeORM的FindOptionsWhere不直接支持>=操作，我们在查询构建器中处理
    }

    // 权限控制：根据用户角色限制查询范围
    if (currentUser.roles?.some((role) => role.name === 'ADMIN')) {
      // 系统管理员可以查看所有教练
      if (storeId) {
        where.storeId = storeId;
      }
    } else if (
      currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER')
    ) {
      // 品牌管理员只能查看自己品牌的教练
      const stores = await this.storeRepository.find({
        where: { brandId: currentUser.brandId },
        select: ['id'],
      });
      const storeIds = stores.map((s) => s.id);

      if (storeId && storeIds.includes(storeId)) {
        where.storeId = storeId;
      } else {
        // 使用查询构建器处理多门店查询
        const queryBuilder = this.coachRepository
          .createQueryBuilder('coach')
          .leftJoinAndSelect('coach.store', 'store')
          .where('coach.storeId IN (:...storeIds)', { storeIds })
          .orderBy(`coach.${sortBy}`, sortOrder)
          .skip((page - 1) * limit)
          .take(limit);

        if (search) {
          queryBuilder.andWhere('coach.name LIKE :search', {
            search: `%${search}%`,
          });
        }
        if (status) {
          queryBuilder.andWhere('coach.status = :status', { status });
        }
        if (gender) {
          queryBuilder.andWhere('coach.gender = :gender', { gender });
        }
        if (specialty) {
          queryBuilder.andWhere('coach.specialties LIKE :specialty', {
            specialty: `%${specialty}%`,
          });
        }
        if (minExperience) {
          queryBuilder.andWhere('coach.experienceYears >= :minExperience', {
            minExperience,
          });
        }

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }
    } else {
      // 门店管理员和其他角色只能查看自己门店的教练
      if (currentUser.storeId) {
        where.storeId = currentUser.storeId;
      }
    }

    // 使用查询构建器处理复杂条件
    const queryBuilder = this.coachRepository
      .createQueryBuilder('coach')
      .leftJoinAndSelect('coach.store', 'store')
      .orderBy(`coach.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    // 应用where条件
    if (where.storeId) {
      queryBuilder.andWhere('coach.storeId = :storeId', {
        storeId: where.storeId,
      });
    }
    if (search) {
      queryBuilder.andWhere('coach.name LIKE :search', {
        search: `%${search}%`,
      });
    }
    if (status) {
      queryBuilder.andWhere('coach.status = :status', { status });
    }
    if (gender) {
      queryBuilder.andWhere('coach.gender = :gender', { gender });
    }
    if (specialty) {
      queryBuilder.andWhere('coach.specialties LIKE :specialty', {
        specialty: `%${specialty}%`,
      });
    }
    if (minExperience) {
      queryBuilder.andWhere('coach.experienceYears >= :minExperience', {
        minExperience,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: User): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: ['store', 'store.brand'],
    });

    if (!coach) {
      throw new NotFoundException('教练不存在');
    }

    // 权限检查
    const canView = this.checkStorePermission(
      currentUser,
      coach.store.brandId,
      coach.storeId,
    );
    if (!canView) {
      throw new ForbiddenException('无权限查看此教练');
    }

    return coach;
  }

  async update(
    id: string,
    updateCoachDto: UpdateCoachDto,
    currentUser: User,
  ): Promise<Coach> {
    const coach = await this.findOne(id, currentUser);

    // 权限检查
    const canUpdate = this.checkStorePermission(
      currentUser,
      coach.store.brandId,
      coach.storeId,
    );
    if (!canUpdate) {
      throw new ForbiddenException('无权限更新此教练');
    }

    // 如果更新手机号，检查是否在门店内已被使用
    if (updateCoachDto.phone && updateCoachDto.phone !== coach.phone) {
      const existingCoach = await this.coachRepository.findOne({
        where: { phone: updateCoachDto.phone, storeId: coach.storeId },
      });

      if (existingCoach) {
        throw new ConflictException('该手机号在此门店已被使用');
      }
    }

    // 如果更新邮箱，检查是否已被使用
    if (updateCoachDto.email && updateCoachDto.email !== coach.email) {
      const existingCoach = await this.coachRepository.findOne({
        where: { email: updateCoachDto.email },
      });

      if (existingCoach) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    Object.assign(coach, updateCoachDto);
    coach.updatedAt = new Date();

    return await this.coachRepository.save(coach);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const coach = await this.findOne(id, currentUser);

    // 权限检查：只有系统管理员和品牌管理员可以删除教练
    const canDelete = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' &&
          currentUser.brandId === coach.store.brandId),
    );

    if (!canDelete) {
      throw new ForbiddenException('无权限删除此教练');
    }

    // 软删除
    coach.status = 'inactive';
    coach.deletedAt = new Date();
    await this.coachRepository.save(coach);
  }

  async getStats(currentUser: User) {
    // 根据用户权限获取统计信息
    let storeIds: string[] = [];

    if (currentUser.roles?.some((role) => role.name === 'ADMIN')) {
      // 系统管理员可以查看全部统计
      const stores = await this.storeRepository.find({ select: ['id'] });
      storeIds = stores.map((s) => s.id);
    } else if (
      currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER')
    ) {
      // 品牌管理员查看自己品牌的统计
      const stores = await this.storeRepository.find({
        where: { brandId: currentUser.brandId },
        select: ['id'],
      });
      storeIds = stores.map((s) => s.id);
    } else {
      // 门店级别统计
      storeIds = currentUser.storeId ? [currentUser.storeId] : [];
    }

    if (storeIds.length === 0) {
      return {
        totalCoaches: 0,
        activeCoaches: 0,
        inactiveCoaches: 0,
        averageExperience: 0,
        coachesBySpecialty: {},
      };
    }

    const totalCoaches = await this.coachRepository
      .createQueryBuilder('coach')
      .where('coach.storeId IN (:...storeIds)', { storeIds })
      .getCount();

    const activeCoaches = await this.coachRepository
      .createQueryBuilder('coach')
      .where('coach.storeId IN (:...storeIds)', { storeIds })
      .andWhere('coach.status = :status', { status: 'active' })
      .getCount();

    // 计算平均从业年限
    const avgResult = await this.coachRepository
      .createQueryBuilder('coach')
      .select('AVG(coach.experienceYears)', 'avg')
      .where('coach.storeId IN (:...storeIds)', { storeIds })
      .andWhere('coach.experienceYears IS NOT NULL')
      .getRawOne();

    const averageExperience = avgResult?.avg
      ? parseFloat(avgResult.avg).toFixed(1)
      : 0;

    return {
      totalCoaches,
      activeCoaches,
      inactiveCoaches: totalCoaches - activeCoaches,
      averageExperience: parseFloat(averageExperience as string),
      coachesBySpecialty: await this.getCoachesBySpecialty(storeIds),
    };
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

  private async getCoachesBySpecialty(storeIds: string[]) {
    const coaches = await this.coachRepository
      .createQueryBuilder('coach')
      .select('coach.specialties')
      .where('coach.storeId IN (:...storeIds)', { storeIds })
      .andWhere('coach.specialties IS NOT NULL')
      .getMany();

    const specialtyCount: { [key: string]: number } = {};

    coaches.forEach((coach) => {
      if (coach.specialties) {
        coach.specialties.forEach((specialty) => {
          specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
        });
      }
    });

    return specialtyCount;
  }
}

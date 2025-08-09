import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Store } from '../entities/store.entity';
import { Brand } from '../entities/brand.entity';
import { User } from '../entities/user.entity';
import { CreateStoreDto, UpdateStoreDto, QueryStoreDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createStoreDto: CreateStoreDto, user: User): Promise<Store> {
    const { brandId, code } = createStoreDto;

    // 验证品牌是否存在且用户有权限
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new BadRequestException('品牌不存在');
    }

    // 权限检查：系统管理员可以为任何品牌创建门店，品牌管理员只能为自己的品牌创建门店
    const canCreate = user.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && user.brandId === brandId),
    );

    if (!canCreate) {
      throw new ForbiddenException('无权限为此品牌创建门店');
    }

    // 检查门店编码在品牌内是否已存在
    const existingStore = await this.storeRepository.findOne({
      where: { code, brandId },
    });

    if (existingStore) {
      throw new ConflictException('门店编码在该品牌内已存在');
    }

    const store = this.storeRepository.create({
      ...createStoreDto,
      status: 'active',
    });

    return await this.storeRepository.save(store);
  }

  async findAll(
    queryDto: QueryStoreDto,
    user: User,
  ): Promise<PaginatedResult<Store>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      brandId,
      city,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    // 构建查询条件
    const where: FindOptionsWhere<Store> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    if (city) {
      where.address = Like(`%${city}%`);
    }

    // 权限控制：根据用户角色限制查询范围
    if (user.roles?.some((role) => role.name === 'ADMIN')) {
      // 系统管理员可以查看所有门店
      if (brandId) {
        where.brandId = brandId;
      }
    } else if (user.roles?.some((role) => role.name === 'BRAND_MANAGER')) {
      // 品牌管理员只能查看自己品牌的门店
      where.brandId = user.brandId;
    } else {
      // 门店管理员和其他角色只能查看自己门店
      where.brandId = user.brandId;
      if (user.storeId) {
        where.id = user.storeId;
      }
    }

    const findOptions: FindManyOptions<Store> = {
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['brand'],
    };

    const [data, total] = await this.storeRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!store) {
      throw new NotFoundException('门店不存在');
    }

    // 权限检查
    const canView = user.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && user.brandId === store.brandId) ||
        (user.brandId === store.brandId &&
          (!user.storeId || user.storeId === store.id)),
    );

    if (!canView) {
      throw new ForbiddenException('无权限查看此门店');
    }

    return store;
  }

  async update(
    id: string,
    updateStoreDto: UpdateStoreDto,
    user: User,
  ): Promise<Store> {
    const store = await this.findOne(id, user);

    // 权限检查：系统管理员、品牌管理员或门店管理员可以更新门店
    const canUpdate = user.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && user.brandId === store.brandId) ||
        (role.name === 'STORE_MANAGER' && user.storeId === store.id),
    );

    if (!canUpdate) {
      throw new ForbiddenException('无权限更新此门店');
    }

    Object.assign(store, updateStoreDto);
    store.updatedAt = new Date();

    return await this.storeRepository.save(store);
  }

  async remove(id: string, user: User): Promise<void> {
    const store = await this.findOne(id, user);

    // 权限检查：只有系统管理员和品牌管理员可以删除门店
    const canDelete = user.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && user.brandId === store.brandId),
    );

    if (!canDelete) {
      throw new ForbiddenException('无权限删除此门店');
    }

    // 软删除
    store.status = 'inactive';
    store.deletedAt = new Date();
    await this.storeRepository.save(store);
  }

  async getStats(id: string, user: User) {
    const store = await this.findOne(id, user);

    // 这里可以添加更多统计信息，比如会员数量、课程数量等
    // 暂时返回基本信息
    return {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      openTime: store.openTime,
      closeTime: store.closeTime,
      status: store.status,
      createdAt: store.createdAt,
      facilities: store.facilities || [],
      // TODO: 添加会员数量、教练数量、课程数量等统计
      memberCount: 0,
      coachCount: 0,
      courseCount: 0,
    };
  }

  async findByBrand(brandId: string, user: User): Promise<Store[]> {
    // 权限检查
    const canView = user.roles?.some(
      (role) => role.name === 'ADMIN' || user.brandId === brandId,
    );

    if (!canView) {
      throw new ForbiddenException('无权限查看此品牌的门店');
    }

    return await this.storeRepository.find({
      where: { brandId, status: 'active' },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
    });
  }
}

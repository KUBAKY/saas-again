import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { User } from '../entities/user.entity';
import { CreateBrandDto, UpdateBrandDto, QueryBrandDto } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto, user: User): Promise<Brand> {
    // 检查用户是否有创建品牌的权限 (只有系统管理员可以创建品牌)
    const isAdmin = user.roles?.some(role => role.name === 'ADMIN');
    if (!isAdmin) {
      throw new ForbiddenException('只有系统管理员可以创建品牌');
    }

    // 检查品牌编码是否已存在
    const existingBrand = await this.brandRepository.findOne({
      where: { code: createBrandDto.code },
    });

    if (existingBrand) {
      throw new ConflictException('品牌编码已存在');
    }

    const brand = this.brandRepository.create({
      ...createBrandDto,
      status: 'active',
    });

    return await this.brandRepository.save(brand);
  }

  async findAll(queryDto: QueryBrandDto, user: User): Promise<PaginatedResult<Brand>> {
    const { page = 1, limit = 20, search, status, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
    
    // 构建查询条件
    const where: FindOptionsWhere<Brand> = {};
    
    if (search) {
      where.name = Like(`%${search}%`);
    }
    
    if (status) {
      where.status = status;
    }

    // 系统管理员可以查看所有品牌，其他用户只能查看自己品牌
    if (!user.roles?.some(role => role.name === 'ADMIN')) {
      where.id = user.brandId;
    }

    const findOptions: FindManyOptions<Brand> = {
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['stores'],
    };

    const [data, total] = await this.brandRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['stores'],
    });

    if (!brand) {
      throw new NotFoundException('品牌不存在');
    }

    // 权限检查：系统管理员可以查看任何品牌，其他用户只能查看自己的品牌
    if (!user.roles?.some(role => role.name === 'ADMIN') && brand.id !== user.brandId) {
      throw new ForbiddenException('无权限查看此品牌');
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto, user: User): Promise<Brand> {
    const brand = await this.findOne(id, user);

    // 权限检查：只有系统管理员或品牌管理员可以更新品牌
    const canUpdate = user.roles?.some(role => 
      role.name === 'ADMIN' || 
      (role.name === 'BRAND_MANAGER' && user.brandId === brand.id)
    );

    if (!canUpdate) {
      throw new ForbiddenException('无权限更新此品牌');
    }

    Object.assign(brand, updateBrandDto);
    brand.updatedAt = new Date();

    return await this.brandRepository.save(brand);
  }

  async remove(id: string, user: User): Promise<void> {
    const brand = await this.findOne(id, user);

    // 只有系统管理员可以删除品牌
    if (!user.roles?.some(role => role.name === 'ADMIN')) {
      throw new ForbiddenException('只有系统管理员可以删除品牌');
    }

    // 软删除
    brand.status = 'inactive';
    brand.deletedAt = new Date();
    await this.brandRepository.save(brand);
  }

  async getStats(id: string, user: User) {
    const brand = await this.findOne(id, user);

    // 获取统计信息
    const storeCount = brand.stores?.length || 0;
    const activeStoreCount = brand.stores?.filter(store => store.status === 'active').length || 0;

    return {
      storeCount,
      activeStoreCount,
      createdAt: brand.createdAt,
      status: brand.status,
    };
  }
}
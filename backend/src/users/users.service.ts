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
  In,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Brand } from '../entities/brand.entity';
import { Store } from '../entities/store.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  QueryUserDto,
  UpdateUserStatusDto,
  UpdateUserRolesDto,
} from './dto';
import { PaginatedResult } from '../brands/brands.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    const { brandId, storeId, roleIds, email, username, phone } = createUserDto;

    // 权限检查：只有系统管理员和品牌管理员可以创建用户
    const canCreate = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && currentUser.brandId === brandId),
    );

    if (!canCreate) {
      throw new ForbiddenException('无权限创建用户');
    }

    // 验证品牌是否存在
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new BadRequestException('品牌不存在');
    }

    // 验证门店是否存在（如果提供了门店ID）
    if (storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: storeId, brandId },
      });

      if (!store) {
        throw new BadRequestException('门店不存在或不属于指定品牌');
      }
    }

    // 检查用户是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }, ...(phone ? [{ phone, brandId }] : [])],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已被使用');
      }
      if (existingUser.username === username) {
        throw new ConflictException('用户名已被使用');
      }
      if (existingUser.phone === phone && existingUser.brandId === brandId) {
        throw new ConflictException('手机号在该品牌内已被使用');
      }
    }

    // 获取角色（如果提供了角色ID）
    let roles: Role[] = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException('部分角色不存在');
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      roles,
    });

    return await this.userRepository.save(user);
  }

  async findAll(
    queryDto: QueryUserDto,
    currentUser: User,
  ): Promise<PaginatedResult<User>> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      brandId,
      storeId,
      roleName,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    // 构建查询条件
    const where: FindOptionsWhere<User> = {};

    if (search) {
      // 这里可以使用更复杂的搜索逻辑
      where.username = Like(`%${search}%`);
    }

    if (status) {
      where.status = status;
    }

    // 权限控制：根据用户角色限制查询范围
    if (currentUser.roles?.some((role) => role.name === 'ADMIN')) {
      // 系统管理员可以查看所有用户
      if (brandId) {
        where.brandId = brandId;
      }
      if (storeId) {
        where.storeId = storeId;
      }
    } else if (
      currentUser.roles?.some((role) => role.name === 'BRAND_MANAGER')
    ) {
      // 品牌管理员只能查看自己品牌的用户
      where.brandId = currentUser.brandId;
      if (storeId) {
        where.storeId = storeId;
      }
    } else {
      // 门店管理员只能查看自己门店的用户
      where.brandId = currentUser.brandId;
      if (currentUser.storeId) {
        where.storeId = currentUser.storeId;
      }
    }

    const findOptions: FindManyOptions<User> = {
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['roles', 'brand', 'store'],
    };

    let [data, total] = await this.userRepository.findAndCount(findOptions);

    // 如果需要按角色过滤
    if (roleName) {
      data = data.filter((user) =>
        user.roles?.some((role) => role.name === roleName),
      );
      total = data.length;
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'brand', 'store'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 权限检查
    const canView = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' &&
          currentUser.brandId === user.brandId) ||
        (currentUser.brandId === user.brandId &&
          (!currentUser.storeId || currentUser.storeId === user.storeId)) ||
        currentUser.id === user.id, // 用户可以查看自己
    );

    if (!canView) {
      throw new ForbiddenException('无权限查看此用户');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // 权限检查
    const canUpdate = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' &&
          currentUser.brandId === user.brandId) ||
        currentUser.id === user.id, // 用户可以更新自己的部分信息
    );

    if (!canUpdate) {
      throw new ForbiddenException('无权限更新此用户');
    }

    // 如果更新邮箱，检查是否已被使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 如果更新手机号，检查是否在品牌内已被使用
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone, brandId: user.brandId },
      });

      if (existingUser) {
        throw new ConflictException('手机号在该品牌内已被使用');
      }
    }

    // 处理角色更新
    if (updateUserDto.roleIds) {
      const roles = await this.roleRepository.find({
        where: { id: In(updateUserDto.roleIds) },
      });

      if (roles.length !== updateUserDto.roleIds.length) {
        throw new BadRequestException('部分角色不存在');
      }

      user.roles = roles;
    }

    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();

    return await this.userRepository.save(user);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateUserStatusDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // 权限检查：只有系统管理员和品牌管理员可以更新用户状态
    const canUpdateStatus = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && currentUser.brandId === user.brandId),
    );

    if (!canUpdateStatus) {
      throw new ForbiddenException('无权限更新用户状态');
    }

    user.status = updateStatusDto.status;
    user.updatedAt = new Date();

    return await this.userRepository.save(user);
  }

  async updateRoles(
    id: string,
    updateRolesDto: UpdateUserRolesDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // 权限检查：只有系统管理员和品牌管理员可以更新用户角色
    const canUpdateRoles = currentUser.roles?.some(
      (role) =>
        role.name === 'ADMIN' ||
        (role.name === 'BRAND_MANAGER' && currentUser.brandId === user.brandId),
    );

    if (!canUpdateRoles) {
      throw new ForbiddenException('无权限更新用户角色');
    }

    const roles = await this.roleRepository.find({
      where: { id: In(updateRolesDto.roleIds) },
    });

    if (roles.length !== updateRolesDto.roleIds.length) {
      throw new BadRequestException('部分角色不存在');
    }

    user.roles = roles;
    user.updatedAt = new Date();

    return await this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id, currentUser);

    // 权限检查：只有系统管理员可以删除用户
    if (!currentUser.roles?.some((role) => role.name === 'ADMIN')) {
      throw new ForbiddenException('只有系统管理员可以删除用户');
    }

    // 防止删除自己
    if (currentUser.id === user.id) {
      throw new BadRequestException('不能删除自己');
    }

    // 软删除
    user.status = 'inactive';
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }
}

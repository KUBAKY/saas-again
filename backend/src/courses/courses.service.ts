import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Course } from '../entities/course.entity';
import { User } from '../entities/user.entity';
import { CreateCourseDto, UpdateCourseDto, QueryCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto, user: User): Promise<Course> {
    const userRole = user.roles?.[0]?.name || '';
    
    // 权限检查：只有门店管理员及以上可以创建课程
    if (
      !['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)
    ) {
      throw new ForbiddenException('权限不足，无法创建课程');
    }

    // 数据隔离：根据用户角色确定门店ID
    let storeId = createCourseDto.storeId;
    if (userRole === 'STORE_MANAGER' && user.storeId) {
      storeId = user.storeId;
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      storeId,
    });

    return await this.courseRepository.save(course);
  }

  async findAll(queryDto: QueryCourseDto, user: User) {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      level,
      storeId,
      coachId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.createBaseQuery(user);

    // 搜索过滤
    if (search) {
      queryBuilder.andWhere('course.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // 类型过滤
    if (type) {
      queryBuilder.andWhere('course.type = :type', { type });
    }

    // 级别过滤
    if (level) {
      queryBuilder.andWhere('course.level = :level', { level });
    }

    // 门店过滤
    if (storeId) {
      queryBuilder.andWhere('course.storeId = :storeId', { storeId });
    }

    // 教练过滤
    if (coachId) {
      queryBuilder.andWhere('course.coachId = :coachId', { coachId });
    }

    // 状态过滤
    if (status) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    // 排序
    const validSortFields = [
      'name',
      'type',
      'price',
      'rating',
      'totalParticipants',
      'createdAt',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(
      `course.${sortField}`,
      sortOrder === 'ASC' ? 'ASC' : 'DESC',
    );

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();

    return {
      data: courses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<Course> {
    const queryBuilder = this.createBaseQuery(user);
    queryBuilder.andWhere('course.id = :id', { id });

    const course = await queryBuilder.getOne();

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id, user);

    const userRole = user.roles?.[0]?.name || '';
    
    // 权限检查
    if (
      !['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)
    ) {
      throw new ForbiddenException('权限不足，无法修改课程');
    }

    // 门店管理员只能修改自己门店的课程
    if (
      userRole === 'STORE_MANAGER' &&
      course.storeId !== user.storeId
    ) {
      throw new ForbiddenException('权限不足，只能修改自己门店的课程');
    }

    Object.assign(course, updateCourseDto);
    course.updatedAt = new Date();

    return await this.courseRepository.save(course);
  }

  async updateStatus(
    id: string,
    status: 'active' | 'inactive' | 'suspended',
    user: User,
  ): Promise<Course> {
    const course = await this.findOne(id, user);

    const userRole = user.roles?.[0]?.name || '';
    
    // 权限检查
    if (
      !['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)
    ) {
      throw new ForbiddenException('权限不足，无法修改课程状态');
    }

    course.status = status;
    course.updatedAt = new Date();

    return await this.courseRepository.save(course);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const course = await this.findOne(id, user);

    const userRole = user.roles?.[0]?.name || '';
    
    // 权限检查
    if (
      !['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)
    ) {
      throw new ForbiddenException('权限不足，无法删除课程');
    }

    course.deletedAt = new Date();
    await this.courseRepository.save(course);

    return { message: '课程删除成功' };
  }

  async getStats(user: User) {
    const queryBuilder = this.createBaseQuery(user, false);

    const [total, active, inactive, personalTraining, groupClasses, workshops] =
      await Promise.all([
        queryBuilder.clone().getCount(),
        queryBuilder
          .clone()
          .andWhere('course.status = :status', { status: 'active' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('course.status = :status', { status: 'inactive' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('course.type = :type', { type: 'personal' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('course.type = :type', { type: 'group' })
          .getCount(),
        queryBuilder
          .clone()
          .andWhere('course.type = :type', { type: 'workshop' })
          .getCount(),
      ]);

    // 获取平均评分
    const avgRatingResult = await queryBuilder
      .clone()
      .select('AVG(course.rating)', 'avgRating')
      .getRawOne();

    return {
      total,
      active,
      inactive,
      byType: {
        personal: personalTraining,
        group: groupClasses,
        workshop: workshops,
      },
      averageRating: parseFloat(avgRatingResult.avgRating) || 0,
    };
  }

  async getPopularCourses(limit: number, user: User) {
    const queryBuilder = this.createBaseQuery(user);

    queryBuilder
      .andWhere('course.status = :status', { status: 'active' })
      .andWhere('course.rating >= :minRating', { minRating: 4.0 })
      .orderBy('course.totalParticipants', 'DESC')
      .addOrderBy('course.rating', 'DESC')
      .take(limit);

    return await queryBuilder.getMany();
  }

  async getCourseBookings(id: string, query: any, user: User) {
    const course = await this.findOne(id, user);

    const { page = 1, limit = 20, status, startDate, endDate } = query;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.bookings', 'booking')
      .leftJoinAndSelect('booking.member', 'member')
      .leftJoinAndSelect('booking.coach', 'coach')
      .where('course.id = :id', { id });

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('booking.startTime >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('booking.startTime <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('booking.startTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const result = await queryBuilder.getOne();
    const bookings = result?.bookings || [];

    return {
      data: bookings,
      meta: {
        page,
        limit,
        total: bookings.length,
        totalPages: Math.ceil(bookings.length / limit),
      },
    };
  }

  private createBaseQuery(
    user: User,
    withRelations: boolean = true,
  ): SelectQueryBuilder<Course> {
    const queryBuilder = this.courseRepository.createQueryBuilder('course');

    if (withRelations) {
      queryBuilder
        .leftJoinAndSelect('course.store', 'store')
        .leftJoinAndSelect('course.coach', 'coach');
    }

    const userRole = user.roles?.[0]?.name || '';
    
    // 数据隔离
    if (userRole === 'STORE_MANAGER' && user.storeId) {
      queryBuilder.andWhere('course.storeId = :storeId', {
        storeId: user.storeId,
      });
    } else if (userRole === 'BRAND_MANAGER' && user.brandId) {
      queryBuilder
        .leftJoin('course.store', 'filterStore')
        .andWhere('filterStore.brandId = :brandId', { brandId: user.brandId });
    }

    // 排除软删除的记录
    queryBuilder.andWhere('course.deletedAt IS NULL');

    return queryBuilder;
  }
}

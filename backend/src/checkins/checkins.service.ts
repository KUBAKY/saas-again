import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, IsNull } from 'typeorm';
import { CheckIn } from '../entities/check-in.entity';
import { User } from '../entities/user.entity';
import { CreateCheckInDto, UpdateCheckInDto, QueryCheckInDto } from './dto';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepository: Repository<CheckIn>,
  ) {}

  async create(
    createCheckInDto: CreateCheckInDto,
    user: User,
  ): Promise<CheckIn> {
    // 数据隔离：根据用户角色确定门店ID
    let storeId = createCheckInDto.storeId;
    if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
      storeId = user.storeId;
    }

    // 检查今日是否已签到（防重复）
    await this.checkDuplicateCheckIn(createCheckInDto.memberId, storeId);

    // 映射checkInMethod到method
    let method: 'manual' | 'qr_code' | 'nfc' | 'app' = 'app';
    if (createCheckInDto.checkInMethod === 'manual') {
      method = 'manual';
    } else if (createCheckInDto.checkInMethod === 'qr_code') {
      method = 'qr_code';
    } else if (createCheckInDto.checkInMethod === 'facial_recognition') {
      method = 'app'; // 面部识别映射为app
    }

    const checkIn = this.checkInRepository.create({
      memberId: createCheckInDto.memberId,
      storeId,
      method,
      deviceInfo: createCheckInDto.deviceInfo,
      notes: createCheckInDto.notes,
      checkInTime: new Date(),
    });

    return await this.checkInRepository.save(checkIn);
  }

  async checkInByQRCode(
    qrCode: string,
    memberId: string,
    user: User,
  ): Promise<CheckIn> {
    // 验证二维码（这里简化处理，实际应该验证二维码的有效性和时效性）
    const qrData = this.parseQRCode(qrCode);
    if (!qrData.valid) {
      throw new BadRequestException('二维码无效或已过期');
    }

    if (!qrData.storeId) {
      throw new BadRequestException('二维码中缺少门店信息');
    }

    const createCheckInDto = {
      memberId,
      storeId: qrData.storeId,
      checkInMethod: 'qr_code' as const,
      deviceInfo: qrData.deviceInfo,
      notes: '二维码签到',
    };

    return await this.create(createCheckInDto, user);
  }

  async findAll(queryDto: QueryCheckInDto, user: User) {
    const {
      page = 1,
      limit = 20,
      memberId,
      storeId,
      startDate,
      endDate,
      sortBy = 'checkInTime',
      sortOrder = 'DESC',
    } = queryDto;

    const queryBuilder = this.createBaseQuery(user);

    // 会员过滤
    if (memberId) {
      queryBuilder.andWhere('checkin.memberId = :memberId', { memberId });
    }

    // 门店过滤
    if (storeId) {
      queryBuilder.andWhere('checkin.storeId = :storeId', { storeId });
    }

    // 日期范围过滤
    if (startDate) {
      queryBuilder.andWhere('checkin.checkInTime >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('checkin.checkInTime <= :endDate', { endDate });
    }

    // 排序
    const validSortFields = ['checkInTime', 'method', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'checkInTime';
    queryBuilder.orderBy(
      `checkin.${sortField}`,
      sortOrder === 'ASC' ? 'ASC' : 'DESC',
    );

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [checkIns, total] = await queryBuilder.getManyAndCount();

    return {
      data: checkIns,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<CheckIn> {
    const queryBuilder = this.createBaseQuery(user);
    queryBuilder.andWhere('checkin.id = :id', { id });

    const checkIn = await queryBuilder.getOne();

    if (!checkIn) {
      throw new NotFoundException('签到记录不存在');
    }

    return checkIn;
  }

  async update(
    id: string,
    updateCheckInDto: UpdateCheckInDto,
    user: User,
  ): Promise<CheckIn> {
    const checkIn = await this.findOne(id, user);

    // 权限检查
    const userRole = user.roles?.[0]?.name || '';
    if (
      !['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)
    ) {
      throw new ForbiddenException('权限不足，无法修改签到记录');
    }

    Object.assign(checkIn, updateCheckInDto);
    checkIn.updatedAt = new Date();

    return await this.checkInRepository.save(checkIn);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const checkIn = await this.findOne(id, user);

    // 权限检查
    const userRole = user.roles?.[0]?.name || '';
    if (
      !['ADMIN', 'BRAND_MANAGER', 'STORE_MANAGER'].includes(userRole)
    ) {
      throw new ForbiddenException('权限不足，无法删除签到记录');
    }

    checkIn.deletedAt = new Date();
    await this.checkInRepository.save(checkIn);

    return { message: '签到记录删除成功' };
  }

  async getStats(user: User) {
    const queryBuilder = this.createBaseQuery(user, false);

    // 总签到次数
    const total = await queryBuilder.clone().getCount();

    // 今日签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await queryBuilder
      .clone()
      .andWhere('checkin.checkInTime >= :today', { today })
      .andWhere('checkin.checkInTime < :tomorrow', { tomorrow })
      .getCount();

    // 本周签到
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekCount = await queryBuilder
      .clone()
      .andWhere('checkin.checkInTime >= :weekStart', { weekStart })
      .andWhere('checkin.checkInTime < :weekEnd', { weekEnd })
      .getCount();

    // 本月签到
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthCount = await queryBuilder
      .clone()
      .andWhere('checkin.checkInTime >= :monthStart', { monthStart })
      .andWhere('checkin.checkInTime < :monthEnd', { monthEnd })
      .getCount();

    // 签到方式统计
    const [manual, qrCode, facial] = await Promise.all([
      queryBuilder
        .clone()
        .andWhere('checkin.method = :method', { method: 'manual' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('checkin.method = :method', { method: 'qr_code' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('checkin.method = :method', {
          method: 'facial_recognition',
        })
        .getCount(),
    ]);

    return {
      total,
      today: todayCount,
      week: weekCount,
      month: monthCount,
      byMethod: {
        manual,
        qrCode,
        facial,
      },
    };
  }

  async getTodayCheckIns(storeId: string, user: User) {
    const queryBuilder = this.createBaseQuery(user);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    queryBuilder
      .andWhere('checkin.checkInTime >= :today', { today })
      .andWhere('checkin.checkInTime < :tomorrow', { tomorrow });

    if (storeId) {
      queryBuilder.andWhere('checkin.storeId = :storeId', { storeId });
    }

    queryBuilder.orderBy('checkin.checkInTime', 'DESC');

    return await queryBuilder.getMany();
  }

  private createBaseQuery(
    user: User,
    withRelations: boolean = true,
  ): SelectQueryBuilder<CheckIn> {
    const queryBuilder = this.checkInRepository.createQueryBuilder('checkin');

    if (withRelations) {
      queryBuilder
        .leftJoinAndSelect('checkin.member', 'member')
        .leftJoinAndSelect('checkin.store', 'store');
    }

    // 数据隔离
    if (user.roles?.[0]?.name === 'STORE_MANAGER' && user.storeId) {
      queryBuilder.andWhere('checkin.storeId = :storeId', {
        storeId: user.storeId,
      });
    } else if (user.roles?.[0]?.name === 'BRAND_MANAGER' && user.brandId) {
      queryBuilder
        .leftJoin('checkin.store', 'filterStore')
        .andWhere('filterStore.brandId = :brandId', { brandId: user.brandId });
    }

    // 排除软删除的记录
    queryBuilder.andWhere('checkin.deletedAt IS NULL');

    return queryBuilder;
  }

  private async checkDuplicateCheckIn(memberId: string, storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await this.checkInRepository.findOne({
      where: {
        memberId,
        storeId,
        checkInTime: Between(today, tomorrow),
        deletedAt: IsNull(),
      },
    });

    if (existingCheckIn) {
      throw new ConflictException('今日已签到，请勿重复签到');
    }
  }

  private parseQRCode(qrCode: string): {
    valid: boolean;
    storeId?: string;
    deviceInfo?: string;
  } {
    try {
      // 这里应该实现真正的二维码解析逻辑
      // 简化处理，假设二维码包含门店ID和设备信息
      const data = JSON.parse(Buffer.from(qrCode, 'base64').toString());

      // 检查时效性（例如：5分钟内有效）
      const now = new Date().getTime();
      const qrTime = new Date(data.timestamp).getTime();
      const validDuration = 5 * 60 * 1000; // 5分钟

      if (now - qrTime > validDuration) {
        return { valid: false };
      }

      return {
        valid: true,
        storeId: data.storeId,
        deviceInfo: data.deviceInfo,
      };
    } catch (error) {
      return { valid: false };
    }
  }
}

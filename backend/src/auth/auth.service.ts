import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Brand } from '../entities/brand.entity';
import { Store } from '../entities/store.entity';
import {
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    realName: string;
    brandId: string;
    storeId?: string;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'brand', 'store'],
      select: [
        'id',
        'email',
        'username',
        'password',
        'realName',
        'brandId',
        'storeId',
        'failedLoginAttempts',
        'lockedAt',
        'status',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查账户状态
    if (!user.isActive()) {
      throw new UnauthorizedException('账户已被禁用或锁定');
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      // 增加失败次数
      user.incrementFailedLoginAttempts();
      await this.userRepository.save(user);

      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 登录成功，重置失败次数
    user.resetFailedLoginAttempts();
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 生成token
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        realName: user.realName,
        brandId: user.brandId,
        storeId: user.storeId,
        roles: user.roles?.map((role) => role.name) || ([] as string[]),
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, email, password, realName, phone, brandId, storeId } =
      registerDto;

    // 检查用户是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }, ...(phone ? [{ phone }] : [])],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已被使用');
      }
      if (existingUser.username === username) {
        throw new ConflictException('用户名已被使用');
      }
      if (existingUser.phone === phone) {
        throw new ConflictException('手机号已被使用');
      }
    }

    // 验证品牌是否存在
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand || !brand.isActive()) {
      throw new BadRequestException('品牌不存在或已禁用');
    }

    // 验证门店是否存在（如果提供了门店ID）
    if (storeId) {
      const store = await this.storeRepository.findOne({
        where: { id: storeId, brandId },
      });

      if (!store || !store.isActive()) {
        throw new BadRequestException('门店不存在或已禁用');
      }
    }

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      password, // 密码会在实体的BeforeInsert钩子中自动加密
      realName,
      phone,
      brandId,
      storeId,
      status: 'active', // 默认激活，实际项目中可能需要邮箱验证
    });

    const savedUser = await this.userRepository.save(user);

    // 重新查询用户以获取关联数据
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['roles', 'brand', 'store'],
    });

    // 生成token
    const tokens = await this.generateTokens(userWithRelations!);

    return {
      ...tokens,
      user: {
        id: userWithRelations!.id,
        username: userWithRelations!.username,
        email: userWithRelations!.email,
        realName: userWithRelations!.realName,
        brandId: userWithRelations!.brandId,
        storeId: userWithRelations!.storeId,
        roles:
          userWithRelations!.roles?.map((role) => role.name) ||
          ([] as string[]),
      },
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<Pick<AuthResponse, 'access_token'>> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });

      if (!user || !user.isActive()) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      const accessToken = await this.generateAccessToken(user);

      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  private async generateTokens(
    user: User,
  ): Promise<Pick<AuthResponse, 'access_token' | 'refresh_token'>> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      brandId: user.brandId,
      storeId: user.storeId,
      roles: user.roles?.map((role) => role.name) || [],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      username: user.username,
      brandId: user.brandId,
      storeId: user.storeId,
      roles: user.roles?.map((role) => role.name) || [],
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'status'],
    });

    if (user && (await user.validatePassword(password)) && user.isActive()) {
      return user;
    }

    return null;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'brand', 'store'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 检查邮箱是否已被其他用户使用
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email },
      });

      if (existingUser) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 检查手机号是否已被其他用户使用
    if (updateProfileDto.phone && updateProfileDto.phone !== user.phone) {
      const existingUser = await this.userRepository.findOne({
        where: { phone: updateProfileDto.phone, brandId: user.brandId },
      });

      if (existingUser) {
        throw new ConflictException('手机号已被使用');
      }
    }

    Object.assign(user, updateProfileDto);
    user.updatedAt = new Date();

    return await this.userRepository.save(user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('新密码与确认密码不一致');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('当前密码错误');
    }

    user.password = newPassword; // 密码会在BeforeUpdate钩子中自动加密
    user.updatedAt = new Date();

    await this.userRepository.save(user);
  }
}

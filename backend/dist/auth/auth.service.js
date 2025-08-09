"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const brand_entity_1 = require("../entities/brand.entity");
const store_entity_1 = require("../entities/store.entity");
let AuthService = class AuthService {
    userRepository;
    brandRepository;
    storeRepository;
    jwtService;
    configService;
    constructor(userRepository, brandRepository, storeRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.brandRepository = brandRepository;
        this.storeRepository = storeRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['roles', 'brand', 'store'],
            select: ['id', 'email', 'username', 'password', 'realName', 'brandId', 'storeId', 'failedLoginAttempts', 'lockedAt', 'status'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        if (!user.isActive()) {
            throw new common_1.UnauthorizedException('账户已被禁用或锁定');
        }
        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            user.incrementFailedLoginAttempts();
            await this.userRepository.save(user);
            throw new common_1.UnauthorizedException('邮箱或密码错误');
        }
        user.resetFailedLoginAttempts();
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
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
                roles: user.roles?.map(role => role.name) || [],
            },
        };
    }
    async register(registerDto) {
        const { username, email, password, realName, phone, brandId, storeId } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: [
                { email },
                { username },
                ...(phone ? [{ phone }] : []),
            ],
        });
        if (existingUser) {
            if (existingUser.email === email) {
                throw new common_1.ConflictException('邮箱已被使用');
            }
            if (existingUser.username === username) {
                throw new common_1.ConflictException('用户名已被使用');
            }
            if (existingUser.phone === phone) {
                throw new common_1.ConflictException('手机号已被使用');
            }
        }
        const brand = await this.brandRepository.findOne({
            where: { id: brandId },
        });
        if (!brand || !brand.isActive()) {
            throw new common_1.BadRequestException('品牌不存在或已禁用');
        }
        if (storeId) {
            const store = await this.storeRepository.findOne({
                where: { id: storeId, brandId },
            });
            if (!store || !store.isActive()) {
                throw new common_1.BadRequestException('门店不存在或已禁用');
            }
        }
        const user = this.userRepository.create({
            username,
            email,
            password,
            realName,
            phone,
            brandId,
            storeId,
            status: 'active',
        });
        const savedUser = await this.userRepository.save(user);
        const userWithRelations = await this.userRepository.findOne({
            where: { id: savedUser.id },
            relations: ['roles', 'brand', 'store'],
        });
        const tokens = await this.generateTokens(userWithRelations);
        return {
            ...tokens,
            user: {
                id: userWithRelations.id,
                username: userWithRelations.username,
                email: userWithRelations.email,
                realName: userWithRelations.realName,
                brandId: userWithRelations.brandId,
                storeId: userWithRelations.storeId,
                roles: userWithRelations.roles?.map(role => role.name) || [],
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
                relations: ['roles'],
            });
            if (!user || !user.isActive()) {
                throw new common_1.UnauthorizedException('用户不存在或已被禁用');
            }
            const accessToken = await this.generateAccessToken(user);
            return { access_token: accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('刷新令牌无效');
        }
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            brandId: user.brandId,
            storeId: user.storeId,
            roles: user.roles?.map(role => role.name) || [],
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('jwt.secret'),
                expiresIn: this.configService.get('jwt.expiresIn'),
            }),
            this.jwtService.signAsync({ sub: user.id }, {
                secret: this.configService.get('jwt.refreshSecret'),
                expiresIn: this.configService.get('jwt.refreshExpiresIn'),
            }),
        ]);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async generateAccessToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            brandId: user.brandId,
            storeId: user.storeId,
            roles: user.roles?.map(role => role.name) || [],
        };
        return this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwt.secret'),
            expiresIn: this.configService.get('jwt.expiresIn'),
        });
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'status'],
        });
        if (user && await user.validatePassword(password) && user.isActive()) {
            return user;
        }
        return null;
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles', 'brand', 'store'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateProfileDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('邮箱已被使用');
            }
        }
        if (updateProfileDto.phone && updateProfileDto.phone !== user.phone) {
            const existingUser = await this.userRepository.findOne({
                where: { phone: updateProfileDto.phone, brandId: user.brandId },
            });
            if (existingUser) {
                throw new common_1.ConflictException('手机号已被使用');
            }
        }
        Object.assign(user, updateProfileDto);
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword, confirmPassword } = changePasswordDto;
        if (newPassword !== confirmPassword) {
            throw new common_1.BadRequestException('新密码与确认密码不一致');
        }
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        const isCurrentPasswordValid = await user.validatePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('当前密码错误');
        }
        user.password = newPassword;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_entity_1.Brand)),
    __param(2, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
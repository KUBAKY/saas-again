import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Brand } from '../entities/brand.entity';
import { Store } from '../entities/store.entity';
import { LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto } from './dto';
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
export declare class AuthService {
    private readonly userRepository;
    private readonly brandRepository;
    private readonly storeRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<User>, brandRepository: Repository<Brand>, storeRepository: Repository<Store>, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<Pick<AuthResponse, 'access_token'>>;
    private generateTokens;
    private generateAccessToken;
    validateUser(email: string, password: string): Promise<User | null>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>;
}

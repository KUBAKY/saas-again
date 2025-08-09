import { AuthService, AuthResponse } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto } from './dto';
import { User } from '../entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<AuthResponse>;
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<Pick<AuthResponse, 'access_token'>>;
    getProfile(user: User): {
        id: string;
        username: string;
        email: string;
        realName: string;
        phone: string | undefined;
        brandId: string;
        storeId: string | undefined;
        roles: string[];
        permissions: string[];
        lastLoginAt: Date | undefined;
    };
    updateProfile(user: User, updateProfileDto: UpdateProfileDto): Promise<User>;
    changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}

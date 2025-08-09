import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UpdateUserStatusDto, UpdateUserRolesDto } from './dto';
import { User } from '../entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, user: User): Promise<User>;
    findAll(queryDto: QueryUserDto, user: User): Promise<import("../brands/brands.service").PaginatedResult<User>>;
    findOne(id: string, user: User): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, user: User): Promise<User>;
    updateStatus(id: string, updateStatusDto: UpdateUserStatusDto, user: User): Promise<User>;
    updateRoles(id: string, updateRolesDto: UpdateUserRolesDto, user: User): Promise<User>;
    remove(id: string, user: User): Promise<void>;
}

import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Brand } from '../entities/brand.entity';
import { Store } from '../entities/store.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UpdateUserStatusDto, UpdateUserRolesDto } from './dto';
import { PaginatedResult } from '../brands/brands.service';
export declare class UsersService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly brandRepository;
    private readonly storeRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, brandRepository: Repository<Brand>, storeRepository: Repository<Store>);
    create(createUserDto: CreateUserDto, currentUser: User): Promise<User>;
    findAll(queryDto: QueryUserDto, currentUser: User): Promise<PaginatedResult<User>>;
    findOne(id: string, currentUser: User): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User>;
    updateStatus(id: string, updateStatusDto: UpdateUserStatusDto, currentUser: User): Promise<User>;
    updateRoles(id: string, updateRolesDto: UpdateUserRolesDto, currentUser: User): Promise<User>;
    remove(id: string, currentUser: User): Promise<void>;
}

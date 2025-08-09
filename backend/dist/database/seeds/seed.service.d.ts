import { Repository } from 'typeorm';
import { Brand, Store, User, Role, Permission, Member, Coach, Course, MembershipCard } from '../../entities';
export declare class SeedService {
    private brandRepository;
    private storeRepository;
    private userRepository;
    private roleRepository;
    private permissionRepository;
    private memberRepository;
    private coachRepository;
    private courseRepository;
    private membershipCardRepository;
    private readonly logger;
    constructor(brandRepository: Repository<Brand>, storeRepository: Repository<Store>, userRepository: Repository<User>, roleRepository: Repository<Role>, permissionRepository: Repository<Permission>, memberRepository: Repository<Member>, coachRepository: Repository<Coach>, courseRepository: Repository<Course>, membershipCardRepository: Repository<MembershipCard>);
    seed(): Promise<void>;
    private seedPermissions;
    private seedRoles;
    private seedBrands;
    private seedStores;
    private seedUsers;
    private seedCoaches;
    private seedCourses;
    private seedMembers;
    private seedMembershipCards;
}

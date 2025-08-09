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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../entities");
let SeedService = SeedService_1 = class SeedService {
    brandRepository;
    storeRepository;
    userRepository;
    roleRepository;
    permissionRepository;
    memberRepository;
    coachRepository;
    courseRepository;
    membershipCardRepository;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(brandRepository, storeRepository, userRepository, roleRepository, permissionRepository, memberRepository, coachRepository, courseRepository, membershipCardRepository) {
        this.brandRepository = brandRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.memberRepository = memberRepository;
        this.coachRepository = coachRepository;
        this.courseRepository = courseRepository;
        this.membershipCardRepository = membershipCardRepository;
    }
    async seed() {
        this.logger.log('开始数据库种子数据初始化...');
        try {
            await this.seedPermissions();
            await this.seedRoles();
            await this.seedBrands();
            await this.seedStores();
            await this.seedUsers();
            await this.seedCoaches();
            await this.seedCourses();
            await this.seedMembers();
            await this.seedMembershipCards();
            this.logger.log('✅ 数据库种子数据初始化完成');
        }
        catch (error) {
            this.logger.error('❌ 数据库种子数据初始化失败', error);
            throw error;
        }
    }
    async seedPermissions() {
        const permissions = [
            {
                name: 'brand:view',
                displayName: '查看品牌',
                group: '品牌管理',
                resource: 'brand',
                action: 'view',
            },
            {
                name: 'brand:create',
                displayName: '创建品牌',
                group: '品牌管理',
                resource: 'brand',
                action: 'create',
            },
            {
                name: 'brand:update',
                displayName: '更新品牌',
                group: '品牌管理',
                resource: 'brand',
                action: 'update',
            },
            {
                name: 'brand:delete',
                displayName: '删除品牌',
                group: '品牌管理',
                resource: 'brand',
                action: 'delete',
            },
            {
                name: 'store:view',
                displayName: '查看门店',
                group: '门店管理',
                resource: 'store',
                action: 'view',
            },
            {
                name: 'store:create',
                displayName: '创建门店',
                group: '门店管理',
                resource: 'store',
                action: 'create',
            },
            {
                name: 'store:update',
                displayName: '更新门店',
                group: '门店管理',
                resource: 'store',
                action: 'update',
            },
            {
                name: 'store:delete',
                displayName: '删除门店',
                group: '门店管理',
                resource: 'store',
                action: 'delete',
            },
            {
                name: 'user:view',
                displayName: '查看用户',
                group: '用户管理',
                resource: 'user',
                action: 'view',
            },
            {
                name: 'user:create',
                displayName: '创建用户',
                group: '用户管理',
                resource: 'user',
                action: 'create',
            },
            {
                name: 'user:update',
                displayName: '更新用户',
                group: '用户管理',
                resource: 'user',
                action: 'update',
            },
            {
                name: 'user:delete',
                displayName: '删除用户',
                group: '用户管理',
                resource: 'user',
                action: 'delete',
            },
            {
                name: 'member:view',
                displayName: '查看会员',
                group: '会员管理',
                resource: 'member',
                action: 'view',
            },
            {
                name: 'member:create',
                displayName: '创建会员',
                group: '会员管理',
                resource: 'member',
                action: 'create',
            },
            {
                name: 'member:update',
                displayName: '更新会员',
                group: '会员管理',
                resource: 'member',
                action: 'update',
            },
            {
                name: 'member:delete',
                displayName: '删除会员',
                group: '会员管理',
                resource: 'member',
                action: 'delete',
            },
            {
                name: 'coach:view',
                displayName: '查看教练',
                group: '教练管理',
                resource: 'coach',
                action: 'view',
            },
            {
                name: 'coach:create',
                displayName: '创建教练',
                group: '教练管理',
                resource: 'coach',
                action: 'create',
            },
            {
                name: 'coach:update',
                displayName: '更新教练',
                group: '教练管理',
                resource: 'coach',
                action: 'update',
            },
            {
                name: 'coach:delete',
                displayName: '删除教练',
                group: '教练管理',
                resource: 'coach',
                action: 'delete',
            },
            {
                name: 'course:view',
                displayName: '查看课程',
                group: '课程管理',
                resource: 'course',
                action: 'view',
            },
            {
                name: 'course:create',
                displayName: '创建课程',
                group: '课程管理',
                resource: 'course',
                action: 'create',
            },
            {
                name: 'course:update',
                displayName: '更新课程',
                group: '课程管理',
                resource: 'course',
                action: 'update',
            },
            {
                name: 'course:delete',
                displayName: '删除课程',
                group: '课程管理',
                resource: 'course',
                action: 'delete',
            },
            {
                name: 'booking:view',
                displayName: '查看预约',
                group: '预约管理',
                resource: 'booking',
                action: 'view',
            },
            {
                name: 'booking:create',
                displayName: '创建预约',
                group: '预约管理',
                resource: 'booking',
                action: 'create',
            },
            {
                name: 'booking:update',
                displayName: '更新预约',
                group: '预约管理',
                resource: 'booking',
                action: 'update',
            },
            {
                name: 'booking:delete',
                displayName: '删除预约',
                group: '预约管理',
                resource: 'booking',
                action: 'delete',
            },
        ];
        for (const permissionData of permissions) {
            const existing = await this.permissionRepository.findOne({
                where: { name: permissionData.name },
            });
            if (!existing) {
                const permission = this.permissionRepository.create({
                    ...permissionData,
                    type: 'system',
                });
                await this.permissionRepository.save(permission);
            }
        }
        this.logger.log('✅ 权限数据初始化完成');
    }
    async seedRoles() {
        const rolesData = [
            {
                name: 'ADMIN',
                displayName: '系统管理员',
                description: '拥有系统全部权限',
                type: 'system',
                priority: 100,
            },
            {
                name: 'BRAND_MANAGER',
                displayName: '品牌管理者',
                description: '管理品牌及其下属门店',
                type: 'system',
                priority: 90,
            },
            {
                name: 'STORE_MANAGER',
                displayName: '门店管理者',
                description: '管理门店运营',
                type: 'system',
                priority: 80,
            },
            {
                name: 'COACH',
                displayName: '健身教练',
                description: '提供健身指导服务',
                type: 'system',
                priority: 70,
            },
            {
                name: 'RECEPTIONIST',
                displayName: '前台接待',
                description: '处理会员服务',
                type: 'system',
                priority: 60,
            },
            {
                name: 'MEMBER',
                displayName: '健身会员',
                description: '享受健身服务',
                type: 'system',
                priority: 50,
            },
        ];
        const allPermissions = await this.permissionRepository.find();
        for (const roleData of rolesData) {
            let role = await this.roleRepository.findOne({
                where: { name: roleData.name },
                relations: ['permissions'],
            });
            if (!role) {
                role = this.roleRepository.create(roleData);
                if (roleData.name === 'ADMIN') {
                    role.permissions = allPermissions;
                }
                else if (roleData.name === 'BRAND_MANAGER') {
                    role.permissions = allPermissions.filter((p) => !p.name.startsWith('brand:delete') &&
                        !p.name.startsWith('user:delete'));
                }
                else if (roleData.name === 'STORE_MANAGER') {
                    role.permissions = allPermissions.filter((p) => p.group !== '品牌管理' && !p.name.includes('delete'));
                }
                else if (roleData.name === 'COACH') {
                    role.permissions = allPermissions
                        .filter((p) => p.group === '会员管理' ||
                        p.group === '课程管理' ||
                        p.group === '预约管理')
                        .filter((p) => p.action === 'view' || p.action === 'update');
                }
                else if (roleData.name === 'RECEPTIONIST') {
                    role.permissions = allPermissions.filter((p) => p.group === '会员管理' || p.group === '预约管理');
                }
                else {
                    role.permissions = [];
                }
                await this.roleRepository.save(role);
            }
        }
        this.logger.log('✅ 角色数据初始化完成');
    }
    async seedBrands() {
        const brandsData = [
            {
                name: 'FitnessPro',
                code: 'FITNESS_PRO',
                description: '专业健身连锁品牌',
                contactPhone: '400-888-0001',
                contactEmail: 'contact@fitnesspro.com',
                status: 'active',
            },
            {
                name: 'PowerGym',
                code: 'POWER_GYM',
                description: '力量训练专门品牌',
                contactPhone: '400-888-0002',
                contactEmail: 'contact@powergym.com',
                status: 'active',
            },
        ];
        for (const brandData of brandsData) {
            const existing = await this.brandRepository.findOne({
                where: { code: brandData.code },
            });
            if (!existing) {
                const brand = this.brandRepository.create(brandData);
                await this.brandRepository.save(brand);
            }
        }
        this.logger.log('✅ 品牌数据初始化完成');
    }
    async seedStores() {
        const brands = await this.brandRepository.find();
        const storesData = [
            {
                brandCode: 'FITNESS_PRO',
                stores: [
                    {
                        name: 'FitnessPro 国贸店',
                        code: 'FP_GUOMAO',
                        address: '北京市朝阳区国贸中心B1层',
                        phone: '010-8888-0001',
                        openTime: '06:00',
                        closeTime: '23:00',
                        status: 'active',
                    },
                    {
                        name: 'FitnessPro 三里屯店',
                        code: 'FP_SANLITUN',
                        address: '北京市朝阳区三里屯太古里南区',
                        phone: '010-8888-0002',
                        openTime: '06:30',
                        closeTime: '22:30',
                        status: 'active',
                    },
                ],
            },
            {
                brandCode: 'POWER_GYM',
                stores: [
                    {
                        name: 'PowerGym 西单店',
                        code: 'PG_XIDAN',
                        address: '北京市西城区西单大悦城6层',
                        phone: '010-8888-0003',
                        openTime: '07:00',
                        closeTime: '22:00',
                        status: 'active',
                    },
                ],
            },
        ];
        for (const brandStores of storesData) {
            const brand = brands.find((b) => b.code === brandStores.brandCode);
            if (!brand)
                continue;
            for (const storeData of brandStores.stores) {
                const existing = await this.storeRepository.findOne({
                    where: { code: storeData.code, brandId: brand.id },
                });
                if (!existing) {
                    const store = this.storeRepository.create({
                        ...storeData,
                        brandId: brand.id,
                    });
                    await this.storeRepository.save(store);
                }
            }
        }
        this.logger.log('✅ 门店数据初始化完成');
    }
    async seedUsers() {
        const brands = await this.brandRepository.find({ relations: ['stores'] });
        const adminRole = await this.roleRepository.findOne({
            where: { name: 'ADMIN' },
        });
        const brandManagerRole = await this.roleRepository.findOne({
            where: { name: 'BRAND_MANAGER' },
        });
        const storeManagerRole = await this.roleRepository.findOne({
            where: { name: 'STORE_MANAGER' },
        });
        if (!adminRole || !brandManagerRole || !storeManagerRole) {
            throw new Error('角色数据未初始化');
        }
        const adminExists = await this.userRepository.findOne({
            where: { email: 'admin@gym-saas.com' },
        });
        if (!adminExists) {
            const admin = this.userRepository.create({
                username: 'admin',
                email: 'admin@gym-saas.com',
                password: 'admin123456',
                realName: '系统管理员',
                brandId: brands[0].id,
                status: 'active',
                roles: [adminRole],
            });
            await this.userRepository.save(admin);
        }
        for (const brand of brands) {
            const brandManagerExists = await this.userRepository.findOne({
                where: { email: `manager@${brand.code.toLowerCase()}.com` },
            });
            if (!brandManagerExists) {
                const brandManager = this.userRepository.create({
                    username: `${brand.code.toLowerCase()}_manager`,
                    email: `manager@${brand.code.toLowerCase()}.com`,
                    password: 'manager123456',
                    realName: `${brand.name}品牌经理`,
                    brandId: brand.id,
                    status: 'active',
                    roles: [brandManagerRole],
                });
                await this.userRepository.save(brandManager);
            }
            for (const store of brand.stores || []) {
                const storeManagerExists = await this.userRepository.findOne({
                    where: { email: `manager@${store.code.toLowerCase()}.com` },
                });
                if (!storeManagerExists) {
                    const storeManager = this.userRepository.create({
                        username: `${store.code.toLowerCase()}_manager`,
                        email: `manager@${store.code.toLowerCase()}.com`,
                        password: 'store123456',
                        realName: `${store.name}店长`,
                        brandId: brand.id,
                        storeId: store.id,
                        status: 'active',
                        roles: [storeManagerRole],
                    });
                    await this.userRepository.save(storeManager);
                }
            }
        }
        this.logger.log('✅ 用户数据初始化完成');
    }
    async seedCoaches() {
        const stores = await this.storeRepository.find({ relations: ['brand'] });
        const coachesData = [
            {
                name: '张教练',
                gender: 'male',
                phone: '13800138001',
                email: 'coach.zhang@gym.com',
                specialties: ['力量训练', '减脂塑形', '功能性训练'],
                experienceYears: 5,
                bio: '5年健身教练经验，专业力量训练指导',
            },
            {
                name: '李教练',
                gender: 'female',
                phone: '13800138002',
                email: 'coach.li@gym.com',
                specialties: ['瑜伽', '普拉提', '减脂塑形'],
                experienceYears: 3,
                bio: '专业瑜伽教练，擅长女性塑形训练',
            },
        ];
        for (const store of stores.slice(0, 2)) {
            for (let i = 0; i < coachesData.length; i++) {
                const coachData = coachesData[i];
                const employeeNumber = `${store.code}_COACH_${(i + 1).toString().padStart(3, '0')}`;
                const existing = await this.coachRepository.findOne({
                    where: { employeeNumber },
                });
                if (!existing) {
                    const coach = this.coachRepository.create({
                        ...coachData,
                        employeeNumber,
                        storeId: store.id,
                        hireDate: new Date(2023, 0, 1),
                        baseSalary: 8000,
                        hourlyRate: 200,
                        status: 'active',
                    });
                    await this.coachRepository.save(coach);
                }
            }
        }
        this.logger.log('✅ 教练数据初始化完成');
    }
    async seedCourses() {
        const stores = await this.storeRepository.find();
        const coaches = await this.coachRepository.find();
        const coursesData = [
            {
                name: '力量训练基础课',
                type: 'group',
                level: 'beginner',
                duration: 60,
                maxParticipants: 8,
                price: 80,
                description: '适合初学者的力量训练课程',
                tags: ['力量训练', '初学者', '基础'],
                caloriesBurn: 300,
            },
            {
                name: '瑜伽流',
                type: 'group',
                level: 'all',
                duration: 90,
                maxParticipants: 12,
                price: 60,
                description: '放松身心的瑜伽流课程',
                tags: ['瑜伽', '放松', '柔韧性'],
                caloriesBurn: 200,
            },
            {
                name: '私人训练',
                type: 'personal',
                level: 'all',
                duration: 60,
                maxParticipants: 1,
                price: 300,
                description: '一对一个性化训练指导',
                tags: ['私教', '个性化', '专业指导'],
                caloriesBurn: 400,
            },
        ];
        for (const store of stores.slice(0, 2)) {
            for (let i = 0; i < coursesData.length; i++) {
                const courseData = coursesData[i];
                const coach = coaches.find((c) => c.storeId === store.id);
                const existing = await this.courseRepository.findOne({
                    where: { name: courseData.name, storeId: store.id },
                });
                if (!existing) {
                    const course = this.courseRepository.create({
                        ...courseData,
                        storeId: store.id,
                        coachId: coach?.id,
                        status: 'active',
                    });
                    await this.courseRepository.save(course);
                }
            }
        }
        this.logger.log('✅ 课程数据初始化完成');
    }
    async seedMembers() {
        const stores = await this.storeRepository.find();
        const membersData = [
            {
                name: '王小明',
                phone: '13900139001',
                email: 'wang@example.com',
                gender: 'male',
                birthday: new Date(1990, 5, 15),
                height: 175,
                weight: 70,
                fitnessGoal: '增肌减脂，提升体能',
                level: 'bronze',
            },
            {
                name: '李小花',
                phone: '13900139002',
                email: 'li@example.com',
                gender: 'female',
                birthday: new Date(1985, 8, 20),
                height: 165,
                weight: 55,
                fitnessGoal: '塑形减脂，改善体态',
                level: 'silver',
            },
            {
                name: '张大力',
                phone: '13900139003',
                email: 'zhang@example.com',
                gender: 'male',
                birthday: new Date(1988, 2, 10),
                height: 180,
                weight: 85,
                fitnessGoal: '力量训练，肌肉增长',
                level: 'gold',
            },
        ];
        let memberCounter = 1;
        for (const store of stores.slice(0, 2)) {
            for (let i = 0; i < membersData.length; i++) {
                const memberData = membersData[i];
                const memberNumber = `M${new Date().getFullYear()}${(memberCounter++).toString().padStart(6, '0')}`;
                const existing = await this.memberRepository.findOne({
                    where: { phone: memberData.phone, storeId: store.id },
                });
                if (!existing) {
                    const member = this.memberRepository.create({
                        ...memberData,
                        memberNumber,
                        storeId: store.id,
                        status: 'active',
                        points: Math.floor(Math.random() * 1000),
                    });
                    await this.memberRepository.save(member);
                }
            }
        }
        this.logger.log('✅ 会员数据初始化完成');
    }
    async seedMembershipCards() {
        const members = await this.memberRepository.find();
        const cardTypes = [
            {
                type: '月卡',
                billingType: 'period',
                price: 299,
                validityDays: 30,
            },
            {
                type: '季卡',
                billingType: 'period',
                price: 699,
                validityDays: 90,
            },
            {
                type: '次卡20次',
                billingType: 'times',
                price: 800,
                totalSessions: 20,
            },
        ];
        let cardCounter = 1;
        for (const member of members.slice(0, 5)) {
            const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            const cardNumber = `C${new Date().getFullYear()}${(cardCounter++).toString().padStart(8, '0')}`;
            const existing = await this.membershipCardRepository.findOne({
                where: { cardNumber },
            });
            if (!existing) {
                const issueDate = new Date();
                const expiryDate = cardType.validityDays
                    ? new Date(issueDate.getTime() + cardType.validityDays * 24 * 60 * 60 * 1000)
                    : undefined;
                const card = this.membershipCardRepository.create({
                    cardNumber,
                    type: cardType.type,
                    billingType: cardType.billingType,
                    price: cardType.price,
                    totalSessions: cardType.totalSessions,
                    validityDays: cardType.validityDays,
                    issueDate,
                    expiryDate,
                    activationDate: issueDate,
                    memberId: member.id,
                    status: 'active',
                });
                await this.membershipCardRepository.save(card);
            }
        }
        this.logger.log('✅ 会员卡数据初始化完成');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Brand)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Store)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Role)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Permission)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Member)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Coach)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.Course)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.MembershipCard)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map
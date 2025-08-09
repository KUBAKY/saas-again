"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const brands_module_1 = require("./brands/brands.module");
const stores_module_1 = require("./stores/stores.module");
const users_module_1 = require("./users/users.module");
const members_module_1 = require("./members/members.module");
const coaches_module_1 = require("./coaches/coaches.module");
const courses_module_1 = require("./courses/courses.module");
const course_schedules_module_1 = require("./course-schedules/course-schedules.module");
const bookings_module_1 = require("./bookings/bookings.module");
const checkins_module_1 = require("./checkins/checkins.module");
const group_class_cards_module_1 = require("./group-class-cards/group-class-cards.module");
const personal_training_cards_module_1 = require("./personal-training-cards/personal-training-cards.module");
const membership_cards_module_1 = require("./membership-cards/membership-cards.module");
const seed_module_1 = require("./database/seeds/seed.module");
const database_config_1 = __importDefault(require("./config/database.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, redis_config_1.default, jwt_config_1.default],
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => configService.get('database'),
            }),
            auth_module_1.AuthModule,
            brands_module_1.BrandsModule,
            stores_module_1.StoresModule,
            users_module_1.UsersModule,
            members_module_1.MembersModule,
            coaches_module_1.CoachesModule,
            courses_module_1.CoursesModule,
            course_schedules_module_1.CourseSchedulesModule,
            bookings_module_1.BookingsModule,
            checkins_module_1.CheckInsModule,
            group_class_cards_module_1.GroupClassCardsModule,
            personal_training_cards_module_1.PersonalTrainingCardsModule,
            membership_cards_module_1.MembershipCardsModule,
            seed_module_1.SeedModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
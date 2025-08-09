"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseSchedulesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const course_schedules_controller_1 = require("./course-schedules.controller");
const course_schedules_service_1 = require("./course-schedules.service");
const course_schedule_entity_1 = require("../entities/course-schedule.entity");
const course_entity_1 = require("../entities/course.entity");
const user_entity_1 = require("../entities/user.entity");
const store_entity_1 = require("../entities/store.entity");
const coach_entity_1 = require("../entities/coach.entity");
let CourseSchedulesModule = class CourseSchedulesModule {
};
exports.CourseSchedulesModule = CourseSchedulesModule;
exports.CourseSchedulesModule = CourseSchedulesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([course_schedule_entity_1.CourseSchedule, course_entity_1.Course, user_entity_1.User, store_entity_1.Store, coach_entity_1.Coach]),
            cache_manager_1.CacheModule.register(),
        ],
        controllers: [course_schedules_controller_1.CourseSchedulesController],
        providers: [course_schedules_service_1.CourseSchedulesService],
        exports: [course_schedules_service_1.CourseSchedulesService],
    })
], CourseSchedulesModule);
//# sourceMappingURL=course-schedules.module.js.map
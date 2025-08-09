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
exports.CourseSchedulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const course_schedules_service_1 = require("./course-schedules.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let CourseSchedulesController = class CourseSchedulesController {
    courseSchedulesService;
    constructor(courseSchedulesService) {
        this.courseSchedulesService = courseSchedulesService;
    }
    create(createDto, user) {
        return this.courseSchedulesService.create(createDto, user);
    }
    findAll(queryDto, user) {
        return this.courseSchedulesService.findAll(queryDto, user);
    }
    getStats(user) {
        return this.courseSchedulesService.getStats(user);
    }
    getCalendarSchedules(query, user) {
        return this.courseSchedulesService.getCalendarSchedules(query, user);
    }
    findOne(id, user) {
        return this.courseSchedulesService.findOne(id, user);
    }
    update(id, updateDto, user) {
        return this.courseSchedulesService.update(id, updateDto, user);
    }
    cancel(id, user, body) {
        return this.courseSchedulesService.cancel(id, body.reason || '管理员取消', user);
    }
    complete(id, user) {
        return this.courseSchedulesService.complete(id, user);
    }
    remove(id, user) {
        return this.courseSchedulesService.remove(id, user);
    }
};
exports.CourseSchedulesController = CourseSchedulesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建课程排课' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '排课创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误或时间冲突' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '排课时间冲突' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCourseScheduleDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取排课列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: '搜索关键字(课程名称/教练姓名)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '排课状态' }),
    (0, swagger_1.ApiQuery)({ name: 'courseId', required: false, description: '课程ID' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, description: '教练ID' }),
    (0, swagger_1.ApiQuery)({ name: 'storeId', required: false, description: '门店ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: '开始日期' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: '结束日期' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: '排序方向' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryCourseScheduleDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取排课统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('calendar'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取日历视图排课数据' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, description: '开始日期' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, description: '结束日期' }),
    (0, swagger_1.ApiQuery)({ name: 'storeId', required: false, description: '门店ID' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, description: '教练ID' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "getCalendarSchedules", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取排课详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '排课不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新排课信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '排课不存在' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '排课时间冲突' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCourseScheduleDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消排课' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '排课取消成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '排课不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '排课无法取消' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: '完成排课' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '排课完成' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '排课不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '排课状态无效' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "complete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除排课' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '排课不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CourseSchedulesController.prototype, "remove", null);
exports.CourseSchedulesController = CourseSchedulesController = __decorate([
    (0, swagger_1.ApiTags)('课程排课管理'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('course-schedules'),
    __metadata("design:paramtypes", [course_schedules_service_1.CourseSchedulesService])
], CourseSchedulesController);
//# sourceMappingURL=course-schedules.controller.js.map
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
exports.CoachesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const coaches_service_1 = require("./coaches.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let CoachesController = class CoachesController {
    coachesService;
    constructor(coachesService) {
        this.coachesService = coachesService;
    }
    create(createCoachDto, user) {
        return this.coachesService.create(createCoachDto, user);
    }
    findAll(queryDto, user) {
        return this.coachesService.findAll(queryDto, user);
    }
    getStats(user) {
        return this.coachesService.getStats(user);
    }
    findOne(id, user) {
        return this.coachesService.findOne(id, user);
    }
    update(id, updateCoachDto, user) {
        return this.coachesService.update(id, updateCoachDto, user);
    }
    remove(id, user) {
        return this.coachesService.remove(id, user);
    }
};
exports.CoachesController = CoachesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建教练' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '教练创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '员工编号或手机号已存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateCoachDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CoachesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取教练列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: '搜索关键字(姓名/员工号)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '状态过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'storeId', required: false, description: '门店ID' }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, description: '性别' }),
    (0, swagger_1.ApiQuery)({ name: 'specialty', required: false, description: '专长' }),
    (0, swagger_1.ApiQuery)({ name: 'minExperience', required: false, description: '最少从业年限' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: '排序方向' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryCoachDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CoachesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取教练统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CoachesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取教练详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '教练不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CoachesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新教练信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '教练不存在' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '手机号或邮箱已被使用' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateCoachDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CoachesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除教练' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '教练不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], CoachesController.prototype, "remove", null);
exports.CoachesController = CoachesController = __decorate([
    (0, swagger_1.ApiTags)('教练管理'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('coaches'),
    __metadata("design:paramtypes", [coaches_service_1.CoachesService])
], CoachesController);
//# sourceMappingURL=coaches.controller.js.map
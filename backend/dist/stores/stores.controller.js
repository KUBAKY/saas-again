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
exports.StoresController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stores_service_1 = require("./stores.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let StoresController = class StoresController {
    storesService;
    constructor(storesService) {
        this.storesService = storesService;
    }
    create(createStoreDto, user) {
        return this.storesService.create(createStoreDto, user);
    }
    findAll(queryDto, user) {
        return this.storesService.findAll(queryDto, user);
    }
    findByBrand(brandId, user) {
        return this.storesService.findByBrand(brandId, user);
    }
    findOne(id, user) {
        return this.storesService.findOne(id, user);
    }
    update(id, updateStoreDto, user) {
        return this.storesService.update(id, updateStoreDto, user);
    }
    remove(id, user) {
        return this.storesService.remove(id, user);
    }
    getStats(id, user) {
        return this.storesService.getStats(id, user);
    }
};
exports.StoresController = StoresController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建门店' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '门店创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '门店编码已存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateStoreDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取门店列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: '搜索关键字' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '状态过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'brandId', required: false, description: '品牌ID' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: '城市过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: '排序方向' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryStoreDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-brand/:brandId'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '根据品牌ID获取门店列表' }),
    (0, swagger_1.ApiParam)({ name: 'brandId', description: '品牌ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "findByBrand", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取门店详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '门店不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新门店' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '门店不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateStoreDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除门店' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '门店不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取门店统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '门店不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "getStats", null);
exports.StoresController = StoresController = __decorate([
    (0, swagger_1.ApiTags)('门店管理'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('stores'),
    __metadata("design:paramtypes", [stores_service_1.StoresService])
], StoresController);
//# sourceMappingURL=stores.controller.js.map
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
exports.MembershipCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const membership_cards_service_1 = require("./membership-cards.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let MembershipCardsController = class MembershipCardsController {
    membershipCardsService;
    constructor(membershipCardsService) {
        this.membershipCardsService = membershipCardsService;
    }
    create(createMembershipCardDto, user) {
        return this.membershipCardsService.create(createMembershipCardDto, user);
    }
    findAll(queryDto, user) {
        return this.membershipCardsService.findAll(queryDto, user);
    }
    getStats(user) {
        return this.membershipCardsService.getStats(user);
    }
    findOne(id, user) {
        return this.membershipCardsService.findOne(id, user);
    }
    update(id, updateMembershipCardDto, user) {
        return this.membershipCardsService.update(id, updateMembershipCardDto, user);
    }
    activate(id, user) {
        return this.membershipCardsService.activate(id, user);
    }
    suspend(id, user, reason) {
        return this.membershipCardsService.suspend(id, reason || '', user);
    }
    renew(id, renewalPeriod, amount, user) {
        return this.membershipCardsService.renew(id, renewalPeriod, amount, user);
    }
    remove(id, user) {
        return this.membershipCardsService.remove(id, user);
    }
};
exports.MembershipCardsController = MembershipCardsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建会员卡' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '会员卡创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateMembershipCardDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取会员卡列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'memberId', required: false, description: '会员ID' }),
    (0, swagger_1.ApiQuery)({ name: 'cardType', required: false, description: '卡类型' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '状态' }),
    (0, swagger_1.ApiQuery)({ name: 'storeId', required: false, description: '门店ID' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryMembershipCardDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取会员卡统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取会员卡详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '会员卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新会员卡信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '会员卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMembershipCardDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: '激活会员卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '激活成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "activate", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    (0, swagger_1.ApiOperation)({ summary: '暂停会员卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '暂停成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "suspend", null);
__decorate([
    (0, common_1.Patch)(':id/renew'),
    (0, swagger_1.ApiOperation)({ summary: '续费会员卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '续费成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('renewalPeriod')),
    __param(2, (0, common_1.Body)('amount')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "renew", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除会员卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '会员卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MembershipCardsController.prototype, "remove", null);
exports.MembershipCardsController = MembershipCardsController = __decorate([
    (0, swagger_1.ApiTags)('会员卡管理'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('membership-cards'),
    __metadata("design:paramtypes", [membership_cards_service_1.MembershipCardsService])
], MembershipCardsController);
//# sourceMappingURL=membership-cards.controller.js.map
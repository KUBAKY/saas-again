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
exports.GroupClassCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const group_class_cards_service_1 = require("../services/group-class-cards.service");
const create_group_class_card_dto_1 = require("../dto/create-group-class-card.dto");
const update_group_class_card_dto_1 = require("../dto/update-group-class-card.dto");
const query_group_class_card_dto_1 = require("../dto/query-group-class-card.dto");
let GroupClassCardsController = class GroupClassCardsController {
    groupClassCardsService;
    constructor(groupClassCardsService) {
        this.groupClassCardsService = groupClassCardsService;
    }
    async create(createDto, req) {
        return await this.groupClassCardsService.create(createDto, req.user);
    }
    async findAll(query, req) {
        return await this.groupClassCardsService.findAll(query, req.user);
    }
    async findOne(id, req) {
        return await this.groupClassCardsService.findOne(id, req.user);
    }
    async update(id, updateDto, req) {
        return await this.groupClassCardsService.update(id, updateDto, req.user);
    }
    async remove(id, req) {
        await this.groupClassCardsService.remove(id, req.user);
        return { message: '删除成功' };
    }
    async activate(id, req) {
        return await this.groupClassCardsService.activate(id, req.user);
    }
    async freeze(id, req) {
        return await this.groupClassCardsService.freeze(id, req.user);
    }
    async unfreeze(id, req) {
        return await this.groupClassCardsService.unfreeze(id, req.user);
    }
    async useSession(id, req) {
        return await this.groupClassCardsService.useSession(id, req.user);
    }
    async expire(id, req) {
        return await this.groupClassCardsService.expire(id, req.user);
    }
};
exports.GroupClassCardsController = GroupClassCardsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建团课卡' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '团课卡创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '会员或会籍卡不存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_class_card_dto_1.CreateGroupClassCardDto, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取团课卡列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_group_class_card_dto_1.QueryGroupClassCardDto, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取团课卡详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新团课卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_class_card_dto_1.UpdateGroupClassCardDto, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除团课卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: '激活团课卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '激活成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/freeze'),
    (0, swagger_1.ApiOperation)({ summary: '冻结团课卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '冻结成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "freeze", null);
__decorate([
    (0, common_1.Post)(':id/unfreeze'),
    (0, swagger_1.ApiOperation)({ summary: '解冻团课卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '解冻成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "unfreeze", null);
__decorate([
    (0, common_1.Post)(':id/use-session'),
    (0, swagger_1.ApiOperation)({ summary: '使用团课卡课时' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '使用成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '团课卡无法使用' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "useSession", null);
__decorate([
    (0, common_1.Post)(':id/expire'),
    (0, swagger_1.ApiOperation)({ summary: '设置团课卡过期' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '设置成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '团课卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassCardsController.prototype, "expire", null);
exports.GroupClassCardsController = GroupClassCardsController = __decorate([
    (0, swagger_1.ApiTags)('团课卡管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('group-class-cards'),
    __metadata("design:paramtypes", [group_class_cards_service_1.GroupClassCardsService])
], GroupClassCardsController);
//# sourceMappingURL=group-class-cards.controller.js.map
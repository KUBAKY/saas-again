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
exports.PersonalTrainingCardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const personal_training_cards_service_1 = require("../services/personal-training-cards.service");
const create_personal_training_card_dto_1 = require("../dto/create-personal-training-card.dto");
const update_personal_training_card_dto_1 = require("../dto/update-personal-training-card.dto");
const query_personal_training_card_dto_1 = require("../dto/query-personal-training-card.dto");
let PersonalTrainingCardsController = class PersonalTrainingCardsController {
    personalTrainingCardsService;
    constructor(personalTrainingCardsService) {
        this.personalTrainingCardsService = personalTrainingCardsService;
    }
    async create(createDto, req) {
        return await this.personalTrainingCardsService.create(createDto, req.user);
    }
    async findAll(query, req) {
        return await this.personalTrainingCardsService.findAll(query, req.user);
    }
    async findOne(id, req) {
        return await this.personalTrainingCardsService.findOne(id, req.user);
    }
    async update(id, updateDto, req) {
        return await this.personalTrainingCardsService.update(id, updateDto, req.user);
    }
    async remove(id, req) {
        await this.personalTrainingCardsService.remove(id, req.user);
        return { message: '删除成功' };
    }
    async activate(id, req) {
        return await this.personalTrainingCardsService.activate(id, req.user);
    }
    async freeze(id, req) {
        return await this.personalTrainingCardsService.freeze(id, req.user);
    }
    async unfreeze(id, req) {
        return await this.personalTrainingCardsService.unfreeze(id, req.user);
    }
    async useSession(id, req) {
        return await this.personalTrainingCardsService.useSession(id, req.user);
    }
    async expire(id, req) {
        return await this.personalTrainingCardsService.expire(id, req.user);
    }
};
exports.PersonalTrainingCardsController = PersonalTrainingCardsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建私教卡' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '私教卡创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '会员、会籍卡或教练不存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_personal_training_card_dto_1.CreatePersonalTrainingCardDto, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取私教卡列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_personal_training_card_dto_1.QueryPersonalTrainingCardDto, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取私教卡详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新私教卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_personal_training_card_dto_1.UpdatePersonalTrainingCardDto, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除私教卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, swagger_1.ApiOperation)({ summary: '激活私教卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '激活成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/freeze'),
    (0, swagger_1.ApiOperation)({ summary: '冻结私教卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '冻结成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "freeze", null);
__decorate([
    (0, common_1.Post)(':id/unfreeze'),
    (0, swagger_1.ApiOperation)({ summary: '解冻私教卡' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '解冻成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "unfreeze", null);
__decorate([
    (0, common_1.Post)(':id/use-session'),
    (0, swagger_1.ApiOperation)({ summary: '使用私教卡课时' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '使用成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '私教卡无法使用' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "useSession", null);
__decorate([
    (0, common_1.Post)(':id/expire'),
    (0, swagger_1.ApiOperation)({ summary: '设置私教卡过期' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '设置成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '私教卡不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingCardsController.prototype, "expire", null);
exports.PersonalTrainingCardsController = PersonalTrainingCardsController = __decorate([
    (0, swagger_1.ApiTags)('私教卡管理'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('personal-training-cards'),
    __metadata("design:paramtypes", [personal_training_cards_service_1.PersonalTrainingCardsService])
], PersonalTrainingCardsController);
//# sourceMappingURL=personal-training-cards.controller.js.map
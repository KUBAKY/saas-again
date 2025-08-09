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
exports.PersonalTrainingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const specialization_decorator_1 = require("../common/decorators/specialization.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
let PersonalTrainingController = class PersonalTrainingController {
    async createBooking(user, req, createBookingDto) {
        const coach = req.coach;
        if (!coach.canManagePersonalTraining()) {
            throw new Error('教练无权限管理私教业务');
        }
        return {
            message: '私教预约创建成功',
            coachId: coach.id,
            coachName: coach.name,
            specializationType: coach.specializationType,
        };
    }
    async getMySessions(user, req, status) {
        const coach = req.coach;
        return {
            message: '获取私教课程成功',
            coachId: coach.id,
            sessions: [],
            filter: { status },
        };
    }
    async completeSession(sessionId, user, req) {
        const coach = req.coach;
        return {
            message: '私教课程已完成',
            sessionId,
            coachId: coach.id,
            completedAt: new Date(),
        };
    }
    async getPersonalTrainingCards(memberId, req) {
        const coach = req.coach;
        return {
            message: '获取私教卡列表成功',
            coachId: coach.id,
            cards: [],
            filter: { memberId },
        };
    }
    async usePersonalTrainingCard(cardId, user, req) {
        const coach = req.coach;
        return {
            message: '私教卡使用成功',
            cardId,
            coachId: coach.id,
            usedAt: new Date(),
        };
    }
};
exports.PersonalTrainingController = PersonalTrainingController;
__decorate([
    (0, common_1.Post)('bookings'),
    (0, specialization_decorator_1.RequirePersonalTrainer)(),
    (0, swagger_1.ApiOperation)({ summary: '创建私教预约' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '预约创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('my-sessions'),
    (0, specialization_decorator_1.RequirePersonalTrainer)(),
    (0, swagger_1.ApiOperation)({ summary: '获取我的私教课程' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, String]),
    __metadata("design:returntype", Promise)
], PersonalTrainingController.prototype, "getMySessions", null);
__decorate([
    (0, common_1.Patch)('sessions/:id/complete'),
    (0, specialization_decorator_1.RequirePersonalTrainer)(),
    (0, swagger_1.ApiOperation)({ summary: '完成私教课程' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '课程ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '课程完成' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingController.prototype, "completeSession", null);
__decorate([
    (0, common_1.Get)('cards'),
    (0, specialization_decorator_1.RequireSpecialization)('personal'),
    (0, swagger_1.ApiOperation)({ summary: '获取私教卡列表' }),
    (0, swagger_1.ApiQuery)({ name: 'memberId', required: false, description: '会员ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('memberId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingController.prototype, "getPersonalTrainingCards", null);
__decorate([
    (0, common_1.Post)('cards/:id/use'),
    (0, specialization_decorator_1.RequirePersonalTrainer)(),
    (0, swagger_1.ApiOperation)({ summary: '使用私教卡' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '私教卡ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '使用成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], PersonalTrainingController.prototype, "usePersonalTrainingCard", null);
exports.PersonalTrainingController = PersonalTrainingController = __decorate([
    (0, swagger_1.ApiTags)('私教业务'),
    (0, common_1.Controller)('api/v1/personal-training'),
    (0, swagger_1.ApiBearerAuth)()
], PersonalTrainingController);
//# sourceMappingURL=personal-training.controller.js.map
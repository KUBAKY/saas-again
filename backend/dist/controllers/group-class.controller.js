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
exports.GroupClassController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const specialization_decorator_1 = require("../common/decorators/specialization.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
let GroupClassController = class GroupClassController {
    async createSchedule(user, req, createScheduleDto) {
        const coach = req.coach;
        if (!coach.canManageGroupClass()) {
            throw new Error('教练无权限管理团课业务');
        }
        const maxStudents = coach.getMaxStudentsPerClass();
        if (createScheduleDto.maxStudents > maxStudents) {
            throw new Error(`超出最大学员数限制: ${maxStudents}`);
        }
        return {
            message: '团课排期创建成功',
            coachId: coach.id,
            coachName: coach.name,
            specializationType: coach.specializationType,
            maxStudents,
        };
    }
    async getMyClasses(user, req, date) {
        const coach = req.coach;
        return {
            message: '获取团课列表成功',
            coachId: coach.id,
            classes: [],
            filter: { date },
            maxStudentsPerClass: coach.getMaxStudentsPerClass(),
        };
    }
    async startClass(classId, user, req) {
        const coach = req.coach;
        return {
            message: '团课已开始',
            classId,
            coachId: coach.id,
            startedAt: new Date(),
        };
    }
    async checkinMember(classId, checkinDto, user, req) {
        const coach = req.coach;
        return {
            message: '会员签到成功',
            classId,
            memberId: checkinDto.memberId,
            coachId: coach.id,
            checkinAt: new Date(),
        };
    }
    async getGroupClassCards(memberId, req) {
        const coach = req.coach;
        return {
            message: '获取团课卡列表成功',
            coachId: coach.id,
            cards: [],
            filter: { memberId },
        };
    }
    async useGroupClassCard(cardId, user, req) {
        const coach = req.coach;
        return {
            message: '团课卡使用成功',
            cardId,
            coachId: coach.id,
            usedAt: new Date(),
        };
    }
    async getStatistics(period = 'month', req) {
        const coach = req.coach;
        return {
            message: '获取团课统计成功',
            coachId: coach.id,
            period,
            statistics: {
                totalClasses: 0,
                totalStudents: 0,
                averageAttendance: 0,
                maxStudentsPerClass: coach.getMaxStudentsPerClass(),
            },
        };
    }
};
exports.GroupClassController = GroupClassController;
__decorate([
    (0, common_1.Post)('schedules'),
    (0, specialization_decorator_1.RequireGroupInstructor)(),
    (0, swagger_1.ApiOperation)({ summary: '创建团课排期' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '排期创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Get)('my-classes'),
    (0, specialization_decorator_1.RequireGroupInstructor)(),
    (0, swagger_1.ApiOperation)({ summary: '获取我的团课' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, String]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "getMyClasses", null);
__decorate([
    (0, common_1.Patch)('classes/:id/start'),
    (0, specialization_decorator_1.RequireGroupInstructor)(),
    (0, swagger_1.ApiOperation)({ summary: '开始团课' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '团课ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '团课已开始' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "startClass", null);
__decorate([
    (0, common_1.Post)('classes/:id/checkin'),
    (0, specialization_decorator_1.RequireGroupInstructor)(),
    (0, swagger_1.ApiOperation)({ summary: '团课签到' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '团课ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '签到成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "checkinMember", null);
__decorate([
    (0, common_1.Get)('cards'),
    (0, specialization_decorator_1.RequireSpecialization)('group'),
    (0, swagger_1.ApiOperation)({ summary: '获取团课卡列表' }),
    (0, swagger_1.ApiQuery)({ name: 'memberId', required: false, description: '会员ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('memberId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "getGroupClassCards", null);
__decorate([
    (0, common_1.Post)('cards/:id/use'),
    (0, specialization_decorator_1.RequireGroupInstructor)(),
    (0, swagger_1.ApiOperation)({ summary: '使用团课卡' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '团课卡ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '使用成功' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "useGroupClassCard", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, specialization_decorator_1.RequireGroupInstructor)(),
    (0, swagger_1.ApiOperation)({ summary: '获取团课统计数据' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, description: '统计周期' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupClassController.prototype, "getStatistics", null);
exports.GroupClassController = GroupClassController = __decorate([
    (0, swagger_1.ApiTags)('团课业务'),
    (0, common_1.Controller)('api/v1/group-class'),
    (0, swagger_1.ApiBearerAuth)()
], GroupClassController);
//# sourceMappingURL=group-class.controller.js.map
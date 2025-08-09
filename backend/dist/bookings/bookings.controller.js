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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    create(createBookingDto, user) {
        return this.bookingsService.create(createBookingDto, user);
    }
    findAll(queryDto, user) {
        return this.bookingsService.findAll(queryDto, user);
    }
    getStats(user) {
        return this.bookingsService.getStats(user);
    }
    getCalendarBookings(query, user) {
        return this.bookingsService.getCalendarBookings(query, user);
    }
    checkConflicts(query, user) {
        return this.bookingsService.checkConflicts(query, user);
    }
    findOne(id, user) {
        return this.bookingsService.findOne(id, user);
    }
    update(id, updateBookingDto, user) {
        return this.bookingsService.update(id, updateBookingDto, user);
    }
    updateStatus(id, status, user, reason) {
        return this.bookingsService.updateStatus(id, status, reason, user);
    }
    confirm(id, user) {
        return this.bookingsService.confirm(id, user);
    }
    cancel(id, user, reason) {
        return this.bookingsService.cancel(id, reason, user);
    }
    complete(id, user) {
        return this.bookingsService.complete(id, user);
    }
    addReview(id, rating, user, review) {
        return this.bookingsService.addReview(id, rating, review, user);
    }
    remove(id, user) {
        return this.bookingsService.remove(id, user);
    }
    processAutoCharging(user) {
        return this.bookingsService.processAutoCharging();
    }
    checkIn(id, user) {
        return this.bookingsService.checkIn(id, user);
    }
    markCompleted(id, user) {
        return this.bookingsService.markCompleted(id, user);
    }
    markNoShow(id, user) {
        return this.bookingsService.markNoShow(id, user);
    }
    createGroupClassBooking(scheduleId, memberId, user) {
        return this.bookingsService.createGroupClassBooking(scheduleId, memberId, user);
    }
    cancelGroupClassBooking(id, user, reason) {
        return this.bookingsService.cancelGroupClassBooking(id, reason, user);
    }
    getMemberBookings(memberId, queryDto, user) {
        return this.bookingsService.getMemberBookings(memberId, queryDto, user);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建预约' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '预约创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误或时间冲突' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '预约时间冲突' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateBookingDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取预约列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        description: '搜索关键字(预约编号/会员姓名)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '预约状态' }),
    (0, swagger_1.ApiQuery)({ name: 'memberId', required: false, description: '会员ID' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, description: '教练ID' }),
    (0, swagger_1.ApiQuery)({ name: 'courseId', required: false, description: '课程ID' }),
    (0, swagger_1.ApiQuery)({ name: 'storeId', required: false, description: '门店ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: '开始日期' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: '结束日期' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: '排序方向' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.QueryBookingDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取预约统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('calendar'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取日历视图预约数据' }),
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
], BookingsController.prototype, "getCalendarBookings", null);
__decorate([
    (0, common_1.Get)('conflicts'),
    (0, swagger_1.ApiOperation)({ summary: '检查预约时间冲突' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '检查完成' }),
    (0, swagger_1.ApiQuery)({ name: 'startTime', required: true, description: '开始时间' }),
    (0, swagger_1.ApiQuery)({ name: 'endTime', required: true, description: '结束时间' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, description: '教练ID' }),
    (0, swagger_1.ApiQuery)({ name: 'memberId', required: false, description: '会员ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'excludeBookingId',
        required: false,
        description: '排除的预约ID',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "checkConflicts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取预约详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新预约信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '预约时间冲突' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateBookingDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '更新预约状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '状态更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '状态转换无效' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: '确认预约' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '预约确认成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '预约状态无法确认' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消预约' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '预约取消成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '预约无法取消' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: '完成预约' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '预约完成' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '预约状态无效' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, swagger_1.ApiOperation)({ summary: '添加预约评价' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '评价添加成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '预约状态无效或已评价' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('rating')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)('review')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "addReview", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除预约' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('auto-charge'),
    (0, swagger_1.ApiOperation)({ summary: '执行自动扣费' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '自动扣费执行成功' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: '权限不足' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "processAutoCharging", null);
__decorate([
    (0, common_1.Patch)(':id/check-in'),
    (0, swagger_1.ApiOperation)({ summary: '会员签到' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '签到成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '签到条件不满足' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Patch)(':id/mark-completed'),
    (0, swagger_1.ApiOperation)({ summary: '标记课程完成' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '标记成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '状态无效' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "markCompleted", null);
__decorate([
    (0, common_1.Patch)(':id/mark-no-show'),
    (0, swagger_1.ApiOperation)({ summary: '标记未到课' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '标记成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '状态无效' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "markNoShow", null);
__decorate([
    (0, common_1.Post)('group-class/:scheduleId'),
    (0, swagger_1.ApiOperation)({ summary: '创建团课预约' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '团课预约创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '排课不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '预约条件不满足' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: '已预约该课程' }),
    __param(0, (0, common_1.Param)('scheduleId')),
    __param(1, (0, common_1.Body)('memberId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "createGroupClassBooking", null);
__decorate([
    (0, common_1.Patch)(':id/cancel-group-class'),
    (0, swagger_1.ApiOperation)({ summary: '取消团课预约' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '团课预约取消成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '预约不存在' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '预约无法取消' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancelGroupClassBooking", null);
__decorate([
    (0, common_1.Get)('member/:memberId/history'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取会员预约历史' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '预约状态' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: '开始日期' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: '结束日期' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: '排序方向' }),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.QueryBookingDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "getMemberBookings", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('预约管理'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map
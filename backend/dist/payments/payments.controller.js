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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    create(createPaymentDto, user) {
        return this.paymentsService.create(createPaymentDto, user);
    }
    findAll(queryDto, user) {
        return this.paymentsService.findAll(queryDto, user);
    }
    getStats(user) {
        return this.paymentsService.getStats(user);
    }
    findOne(id, user) {
        return this.paymentsService.findOne(id, user);
    }
    confirmPayment(id, user) {
        return this.paymentsService.confirmPayment(id, user);
    }
    cancelPayment(id, reason, user) {
        return this.paymentsService.cancelPayment(id, reason, user);
    }
    refund(refundDto, user) {
        return this.paymentsService.refund(refundDto, user);
    }
    createInstallmentPayment(installmentData, user) {
        return this.paymentsService.createInstallmentPayment(installmentData.orderId, installmentData.installmentPlan, user);
    }
    getPaymentTrends(startDate, endDate, user) {
        return this.paymentsService.getPaymentTrends(new Date(startDate), new Date(endDate), user);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建支付记录' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '支付记录创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取支付记录列表' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'orderId', required: false, description: '订单ID' }),
    (0, swagger_1.ApiQuery)({ name: 'paymentMethod', required: false, description: '支付方式' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '支付状态' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取支付统计信息' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取支付记录详情' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '支付记录不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: '确认支付完成' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付确认成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '支付状态不正确' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '支付记录不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: '取消支付' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '支付取消成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '支付状态不正确' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '支付记录不存在' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "cancelPayment", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, swagger_1.ApiOperation)({ summary: '申请退款' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '退款申请成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '退款条件不满足' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '支付记录不存在' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "refund", null);
__decorate([
    (0, common_1.Post)('installment'),
    (0, swagger_1.ApiOperation)({ summary: '创建分期付款' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '分期付款创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "createInstallmentPayment", null);
__decorate([
    (0, common_1.Get)('trends/:startDate/:endDate'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, swagger_1.ApiOperation)({ summary: '获取支付趋势分析' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '获取成功' }),
    __param(0, (0, common_1.Param)('startDate')),
    __param(1, (0, common_1.Param)('endDate')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getPaymentTrends", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('支付管理'),
    (0, swagger_1.ApiBearerAuth)('bearer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map
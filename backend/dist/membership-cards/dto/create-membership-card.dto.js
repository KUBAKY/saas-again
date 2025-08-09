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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMembershipCardDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateMembershipCardDto {
    cardNumber;
    type;
    billingType;
    price;
    totalSessions;
    validityDays;
    issueDate;
    expiryDate;
    activationDate;
    status;
    notes;
    settings;
    memberId;
}
exports.CreateMembershipCardDto = CreateMembershipCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '卡号' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "cardNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '卡类型名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '计费方式', enum: ['times', 'period', 'unlimited'] }),
    (0, class_validator_1.IsEnum)(['times', 'period', 'unlimited']),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "billingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '卡片价格' }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMembershipCardDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '总次数（次卡）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMembershipCardDto.prototype, "totalSessions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '有效期（天数）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3650),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMembershipCardDto.prototype, "validityDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开卡日期' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "issueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '到期日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '激活日期' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "activationDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '卡状态', enum: ['active', 'inactive', 'expired', 'frozen', 'refunded'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'inactive', 'expired', 'frozen', 'refunded']),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '备注信息' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '卡片配置' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMembershipCardDto.prototype, "settings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '会员ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMembershipCardDto.prototype, "memberId", void 0);
//# sourceMappingURL=create-membership-card.dto.js.map
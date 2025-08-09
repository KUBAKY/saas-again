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
exports.QueryPersonalTrainingCardDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class QueryPersonalTrainingCardDto {
    page = 1;
    limit = 20;
    memberId;
    membershipCardId;
    coachId;
    type;
    status;
    purchaseDateStart;
    purchaseDateEnd;
    search;
}
exports.QueryPersonalTrainingCardDto = QueryPersonalTrainingCardDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', example: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryPersonalTrainingCardDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', example: 20, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryPersonalTrainingCardDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '会员ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "memberId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '会籍卡ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "membershipCardId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '教练ID',
        example: '123e4567-e89b-12d3-a456-426614174002',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '私教卡类型',
        example: '高级私教卡',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '卡片状态',
        enum: ['inactive', 'active', 'frozen', 'expired'],
        example: 'active',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['inactive', 'active', 'frozen', 'expired']),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '购买开始日期',
        example: '2024-01-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "purchaseDateStart", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '购买结束日期',
        example: '2024-12-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "purchaseDateEnd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '搜索关键词（卡号、类型）',
        example: 'PTC',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryPersonalTrainingCardDto.prototype, "search", void 0);
//# sourceMappingURL=query-personal-training-card.dto.js.map
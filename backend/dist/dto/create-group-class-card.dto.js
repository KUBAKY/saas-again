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
exports.CreateGroupClassCardDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateGroupClassCardDto {
    memberId;
    membershipCardId;
    type;
    price;
    totalSessions;
    purchaseDate;
    notes;
    settings;
}
exports.CreateGroupClassCardDto = CreateGroupClassCardDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '会员ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGroupClassCardDto.prototype, "memberId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '会籍卡ID',
        example: '123e4567-e89b-12d3-a456-426614174001',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGroupClassCardDto.prototype, "membershipCardId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '团课卡类型',
        example: '瑜伽团课卡',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupClassCardDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '价格',
        example: 1200.0,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGroupClassCardDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '总课时数',
        example: 20,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateGroupClassCardDto.prototype, "totalSessions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '购买日期',
        example: '2024-01-15',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGroupClassCardDto.prototype, "purchaseDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '备注',
        example: '新会员优惠价',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupClassCardDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '卡片设置',
        example: {
            autoActivate: true,
            transferable: false,
            refundable: true,
        },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateGroupClassCardDto.prototype, "settings", void 0);
//# sourceMappingURL=create-group-class-card.dto.js.map
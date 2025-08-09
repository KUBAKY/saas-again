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
exports.CreateBrandDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateBrandDto {
    name;
    code;
    description;
    contactPhone;
    contactEmail;
    logoUrl;
    websiteUrl;
}
exports.CreateBrandDto = CreateBrandDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌名称', example: 'FitnessPro' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌编码', example: 'FITNESS_PRO' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(2, 50),
    (0, class_validator_1.Matches)(/^[A-Z0-9_]+$/, { message: '品牌编码只能包含大写字母、数字和下划线' }),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌描述', example: '专业健身连锁品牌', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话', example: '400-888-0001', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系邮箱', example: 'contact@fitnesspro.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌LOGO URL', example: 'https://example.com/logo.png', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '官网地址', example: 'https://www.fitnesspro.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBrandDto.prototype, "websiteUrl", void 0);
//# sourceMappingURL=create-brand.dto.js.map
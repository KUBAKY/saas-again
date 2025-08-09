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
exports.CreateStoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateStoreDto {
    name;
    code;
    brandId;
    address;
    phone;
    openTime;
    closeTime;
    description;
    images;
    facilities;
    longitude;
    latitude;
}
exports.CreateStoreDto = CreateStoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店名称', example: 'FitnessPro 国贸店' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店编码', example: 'FP_GUOMAO' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(2, 50),
    (0, class_validator_1.Matches)(/^[A-Z0-9_]+$/, { message: '门店编码只能包含大写字母、数字和下划线' }),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '品牌ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店地址', example: '北京市朝阳区国贸中心B1层' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '联系电话', example: '010-8888-0001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开门时间', example: '06:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '开门时间格式应为 HH:mm' }),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关门时间', example: '23:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: '关门时间格式应为 HH:mm' }),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "closeTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店描述', example: '位于CBD核心区域的旗舰店', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店照片URL列表', example: ['https://example.com/store1.jpg'], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateStoreDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '设施列表', example: ['器械区', '有氧区', '团课室'], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateStoreDto.prototype, "facilities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '经度', example: 116.4074, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateStoreDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '纬度', example: 39.9042, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateStoreDto.prototype, "latitude", void 0);
//# sourceMappingURL=create-store.dto.js.map
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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RegisterDto {
    username;
    email;
    password;
    realName;
    phone;
    brandId;
    storeId;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '用户名',
        example: 'john_doe',
    }),
    (0, class_validator_1.IsString)({ message: '用户名必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '用户名不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '邮箱地址',
        example: 'john@example.com',
    }),
    (0, class_validator_1.IsEmail)({}, { message: '请输入有效的邮箱地址' }),
    (0, class_validator_1.IsNotEmpty)({ message: '邮箱地址不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '密码',
        example: 'password123',
        minLength: 6,
    }),
    (0, class_validator_1.IsString)({ message: '密码必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '密码不能为空' }),
    (0, class_validator_1.MinLength)(6, { message: '密码至少6位' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '真实姓名',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsString)({ message: '真实姓名必须是字符串' }),
    (0, class_validator_1.IsNotEmpty)({ message: '真实姓名不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "realName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '手机号码',
        example: '13800138000',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '手机号码必须是字符串' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '品牌ID',
        example: 'uuid',
    }),
    (0, class_validator_1.IsUUID)(4, { message: '品牌ID格式不正确' }),
    (0, class_validator_1.IsNotEmpty)({ message: '品牌ID不能为空' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "brandId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '门店ID',
        example: 'uuid',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(4, { message: '门店ID格式不正确' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "storeId", void 0);
//# sourceMappingURL=register.dto.js.map
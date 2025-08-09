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
exports.CreateMemberDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMemberDto {
    name;
    phone;
    email;
    gender;
    birthday;
    height;
    weight;
    storeId;
    level = 'bronze';
    fitnessGoal;
    emergencyContact;
    emergencyPhone;
    avatar;
    notes;
}
exports.CreateMemberDto = CreateMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '会员姓名', example: '张三' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(11, 11),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '邮箱', example: 'member@example.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别', example: 'male', enum: ['male', 'female'] }),
    (0, class_validator_1.IsIn)(['male', 'female']),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '生日', example: '1990-01-01', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "birthday", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '身高(cm)', example: 175, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(250),
    __metadata("design:type", Number)
], CreateMemberDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '体重(kg)', example: 70, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(30),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateMemberDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '会员等级',
        example: 'bronze',
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['bronze', 'silver', 'gold', 'platinum']),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '健身目标', example: '减肥塑形', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 200),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "fitnessGoal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '紧急联系人', example: '李四', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "emergencyContact", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '紧急联系人电话', example: '13900139000', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 20),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "emergencyPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '会员头像URL', example: 'https://example.com/avatar.jpg', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: '新会员', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], CreateMemberDto.prototype, "notes", void 0);
//# sourceMappingURL=create-member.dto.js.map
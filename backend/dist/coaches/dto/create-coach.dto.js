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
exports.CreateCoachDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCoachDto {
    name;
    employeeNumber;
    phone;
    email;
    gender;
    storeId;
    hireDate;
    specialties;
    experienceYears;
    bio;
    baseSalary;
    hourlyRate;
    avatar;
    certifications;
    notes;
}
exports.CreateCoachDto = CreateCoachDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '教练姓名', example: '张教练' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '员工编号', example: 'FP_GUOMAO_COACH_001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "employeeNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号', example: '13800138001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(11, 11),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '邮箱', example: 'coach@gym.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别', example: 'male', enum: ['male', 'female'] }),
    (0, class_validator_1.IsIn)(['male', 'female']),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店ID', example: '123e4567-e89b-12d3-a456-426614174000' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '入职日期', example: '2023-01-01', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "hireDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '专长',
        example: ['力量训练', '减脂塑形', '功能性训练'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCoachDto.prototype, "specialties", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '从业年限', example: 5, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateCoachDto.prototype, "experienceYears", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '个人简介', example: '5年健身教练经验，专业力量训练指导', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '基本工资', example: 8000, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCoachDto.prototype, "baseSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '课时费', example: 200, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCoachDto.prototype, "hourlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '教练头像URL', example: 'https://example.com/avatar.jpg', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '认证资质', example: ['ACSM认证', 'NASM认证'], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCoachDto.prototype, "certifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', example: '优秀教练', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 500),
    __metadata("design:type", String)
], CreateCoachDto.prototype, "notes", void 0);
//# sourceMappingURL=create-coach.dto.js.map
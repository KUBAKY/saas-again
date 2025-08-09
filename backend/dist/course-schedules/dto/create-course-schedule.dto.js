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
exports.CreateCourseScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCourseScheduleDto {
    courseId;
    coachId;
    storeId;
    startTime;
    endTime;
    maxParticipants;
    notes;
}
exports.CreateCourseScheduleDto = CreateCourseScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '课程ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: '课程ID不能为空' }),
    (0, class_validator_1.IsString)({ message: '课程ID必须是字符串' }),
    __metadata("design:type", String)
], CreateCourseScheduleDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '教练ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: '教练ID不能为空' }),
    (0, class_validator_1.IsString)({ message: '教练ID必须是字符串' }),
    __metadata("design:type", String)
], CreateCourseScheduleDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: '门店ID不能为空' }),
    (0, class_validator_1.IsString)({ message: '门店ID必须是字符串' }),
    __metadata("design:type", String)
], CreateCourseScheduleDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始时间' }),
    (0, class_validator_1.IsNotEmpty)({ message: '开始时间不能为空' }),
    (0, class_validator_1.IsDateString)({}, { message: '开始时间格式不正确' }),
    __metadata("design:type", Date)
], CreateCourseScheduleDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束时间' }),
    (0, class_validator_1.IsNotEmpty)({ message: '结束时间不能为空' }),
    (0, class_validator_1.IsDateString)({}, { message: '结束时间格式不正确' }),
    __metadata("design:type", Date)
], CreateCourseScheduleDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '最大参与人数' }),
    (0, class_validator_1.IsNotEmpty)({ message: '最大参与人数不能为空' }),
    (0, class_validator_1.IsNumber)({}, { message: '最大参与人数必须是数字' }),
    (0, class_validator_1.Min)(1, { message: '最大参与人数不能少于1人' }),
    (0, class_validator_1.Max)(50, { message: '最大参与人数不能超过50人' }),
    __metadata("design:type", Number)
], CreateCourseScheduleDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '备注必须是字符串' }),
    __metadata("design:type", String)
], CreateCourseScheduleDto.prototype, "notes", void 0);
//# sourceMappingURL=create-course-schedule.dto.js.map
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
exports.QueryCourseScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class QueryCourseScheduleDto {
    page = 1;
    limit = 20;
    search;
    status;
    courseId;
    coachId;
    storeId;
    startDate;
    endDate;
    sortBy = 'startTime';
    sortOrder = 'ASC';
}
exports.QueryCourseScheduleDto = QueryCourseScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页码', required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: '页码必须是数字' }),
    __metadata("design:type", Number)
], QueryCourseScheduleDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量', required: false, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({}, { message: '每页数量必须是数字' }),
    __metadata("design:type", Number)
], QueryCourseScheduleDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索关键字', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '搜索关键字必须是字符串' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '排课状态', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '状态必须是字符串' }),
    (0, class_validator_1.IsIn)(['scheduled', 'completed', 'cancelled'], { message: '状态值无效' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '课程ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '课程ID必须是字符串' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '教练ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '教练ID必须是字符串' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '门店ID', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '门店ID必须是字符串' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '开始日期', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: '开始日期格式不正确' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '结束日期', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: '结束日期格式不正确' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '排序字段', required: false, default: 'startTime' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '排序字段必须是字符串' }),
    (0, class_validator_1.IsIn)(['startTime', 'endTime', 'status', 'createdAt'], { message: '排序字段无效' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '排序方向', required: false, default: 'ASC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: '排序方向必须是字符串' }),
    (0, class_validator_1.IsIn)(['ASC', 'DESC'], { message: '排序方向无效' }),
    __metadata("design:type", String)
], QueryCourseScheduleDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-course-schedule.dto.js.map
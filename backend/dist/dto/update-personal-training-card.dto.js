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
exports.UpdatePersonalTrainingCardDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_personal_training_card_dto_1 = require("./create-personal-training-card.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdatePersonalTrainingCardDto extends (0, swagger_1.PartialType)(create_personal_training_card_dto_1.CreatePersonalTrainingCardDto) {
    status;
}
exports.UpdatePersonalTrainingCardDto = UpdatePersonalTrainingCardDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: '卡片状态',
        enum: ['inactive', 'active', 'frozen', 'expired', 'refunded'],
        example: 'active',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['inactive', 'active', 'frozen', 'expired', 'refunded']),
    __metadata("design:type", String)
], UpdatePersonalTrainingCardDto.prototype, "status", void 0);
//# sourceMappingURL=update-personal-training-card.dto.js.map
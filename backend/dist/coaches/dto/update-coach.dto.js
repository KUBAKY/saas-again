"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCoachDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_coach_dto_1 = require("./create-coach.dto");
class UpdateCoachDto extends (0, swagger_1.PartialType)((0, swagger_1.OmitType)(create_coach_dto_1.CreateCoachDto, ['employeeNumber', 'storeId'])) {
}
exports.UpdateCoachDto = UpdateCoachDto;
//# sourceMappingURL=update-coach.dto.js.map
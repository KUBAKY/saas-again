"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCheckInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_checkin_dto_1 = require("./create-checkin.dto");
class UpdateCheckInDto extends (0, swagger_1.PartialType)(create_checkin_dto_1.CreateCheckInDto) {
}
exports.UpdateCheckInDto = UpdateCheckInDto;
//# sourceMappingURL=update-checkin.dto.js.map
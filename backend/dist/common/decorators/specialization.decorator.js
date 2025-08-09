"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireGroupInstructor = exports.RequirePersonalTrainer = exports.RequireSpecialization = void 0;
const common_1 = require("@nestjs/common");
const specialization_guard_1 = require("../guards/specialization.guard");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const RequireSpecialization = (type) => {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, specialization_guard_1.SpecializationGuard), (0, common_1.SetMetadata)('specialization', type));
};
exports.RequireSpecialization = RequireSpecialization;
const RequirePersonalTrainer = () => (0, exports.RequireSpecialization)('personal');
exports.RequirePersonalTrainer = RequirePersonalTrainer;
const RequireGroupInstructor = () => (0, exports.RequireSpecialization)('group');
exports.RequireGroupInstructor = RequireGroupInstructor;
//# sourceMappingURL=specialization.decorator.js.map
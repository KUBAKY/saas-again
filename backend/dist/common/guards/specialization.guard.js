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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecializationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coach_entity_1 = require("../../entities/coach.entity");
const user_entity_1 = require("../../entities/user.entity");
let SpecializationGuard = class SpecializationGuard {
    reflector;
    coachRepository;
    userRepository;
    constructor(reflector, coachRepository, userRepository) {
        this.reflector = reflector;
        this.coachRepository = coachRepository;
        this.userRepository = userRepository;
    }
    async canActivate(context) {
        const requiredSpecialization = this.reflector.get('specialization', context.getHandler());
        if (!requiredSpecialization) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('用户未认证');
        }
        const userWithCoach = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['roles'],
        });
        const isCoach = userWithCoach?.roles?.some((role) => role.name === 'COACH' ||
            role.name === 'PERSONAL_TRAINER' ||
            role.name === 'GROUP_FITNESS_INSTRUCTOR');
        if (!isCoach) {
            throw new common_1.ForbiddenException('只有教练可以访问此资源');
        }
        const coach = await this.coachRepository.findOne({
            where: { employeeNumber: user.employeeNumber },
        });
        if (!coach) {
            throw new common_1.ForbiddenException('教练信息不存在');
        }
        const hasSpecialization = this.checkSpecialization(coach, requiredSpecialization);
        if (!hasSpecialization) {
            throw new common_1.ForbiddenException(`此操作需要${requiredSpecialization === 'personal' ? '私人教练' : '团课教练'}权限`);
        }
        request.coach = coach;
        return true;
    }
    checkSpecialization(coach, requiredSpecialization) {
        switch (requiredSpecialization) {
            case 'personal':
                return coach.isPersonalTrainer() && coach.canManagePersonalTraining();
            case 'group':
                return coach.isGroupInstructor() && coach.canManageGroupClass();
            default:
                return false;
        }
    }
};
exports.SpecializationGuard = SpecializationGuard;
exports.SpecializationGuard = SpecializationGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(coach_entity_1.Coach)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [core_1.Reflector,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SpecializationGuard);
//# sourceMappingURL=specialization.guard.js.map
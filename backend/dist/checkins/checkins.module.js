"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckInsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const checkins_service_1 = require("./checkins.service");
const checkins_controller_1 = require("./checkins.controller");
const check_in_entity_1 = require("../entities/check-in.entity");
let CheckInsModule = class CheckInsModule {
};
exports.CheckInsModule = CheckInsModule;
exports.CheckInsModule = CheckInsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([check_in_entity_1.CheckIn]),
            cache_manager_1.CacheModule.register({
                ttl: 5 * 60,
            }),
        ],
        controllers: [checkins_controller_1.CheckInsController],
        providers: [checkins_service_1.CheckInsService],
        exports: [checkins_service_1.CheckInsService],
    })
], CheckInsModule);
//# sourceMappingURL=checkins.module.js.map
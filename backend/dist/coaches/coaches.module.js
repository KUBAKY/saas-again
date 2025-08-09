"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const coaches_service_1 = require("./coaches.service");
const coaches_controller_1 = require("./coaches.controller");
const coach_entity_1 = require("../entities/coach.entity");
const store_entity_1 = require("../entities/store.entity");
let CoachesModule = class CoachesModule {
};
exports.CoachesModule = CoachesModule;
exports.CoachesModule = CoachesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([coach_entity_1.Coach, store_entity_1.Store]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
            }),
        ],
        controllers: [coaches_controller_1.CoachesController],
        providers: [coaches_service_1.CoachesService],
        exports: [coaches_service_1.CoachesService],
    })
], CoachesModule);
//# sourceMappingURL=coaches.module.js.map
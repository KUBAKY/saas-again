"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoresModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const stores_service_1 = require("./stores.service");
const stores_controller_1 = require("./stores.controller");
const store_entity_1 = require("../entities/store.entity");
const brand_entity_1 = require("../entities/brand.entity");
let StoresModule = class StoresModule {
};
exports.StoresModule = StoresModule;
exports.StoresModule = StoresModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([store_entity_1.Store, brand_entity_1.Brand]),
            cache_manager_1.CacheModule.register({
                ttl: 300,
            }),
        ],
        controllers: [stores_controller_1.StoresController],
        providers: [stores_service_1.StoresService],
        exports: [stores_service_1.StoresService],
    })
], StoresModule);
//# sourceMappingURL=stores.module.js.map
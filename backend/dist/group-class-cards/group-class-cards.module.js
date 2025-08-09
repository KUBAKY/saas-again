"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupClassCardsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const group_class_cards_controller_1 = require("../controllers/group-class-cards.controller");
const group_class_cards_service_1 = require("../services/group-class-cards.service");
const group_class_card_entity_1 = require("../entities/group-class-card.entity");
const member_entity_1 = require("../entities/member.entity");
const membership_card_entity_1 = require("../entities/membership-card.entity");
let GroupClassCardsModule = class GroupClassCardsModule {
};
exports.GroupClassCardsModule = GroupClassCardsModule;
exports.GroupClassCardsModule = GroupClassCardsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                group_class_card_entity_1.GroupClassCard,
                member_entity_1.Member,
                membership_card_entity_1.MembershipCard,
            ]),
        ],
        controllers: [group_class_cards_controller_1.GroupClassCardsController],
        providers: [group_class_cards_service_1.GroupClassCardsService],
        exports: [group_class_cards_service_1.GroupClassCardsService],
    })
], GroupClassCardsModule);
//# sourceMappingURL=group-class-cards.module.js.map
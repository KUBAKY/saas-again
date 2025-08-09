"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipCardsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const membership_cards_service_1 = require("./membership-cards.service");
const membership_cards_controller_1 = require("./membership-cards.controller");
const membership_card_entity_1 = require("../entities/membership-card.entity");
const member_entity_1 = require("../entities/member.entity");
let MembershipCardsModule = class MembershipCardsModule {
};
exports.MembershipCardsModule = MembershipCardsModule;
exports.MembershipCardsModule = MembershipCardsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([membership_card_entity_1.MembershipCard, member_entity_1.Member])],
        controllers: [membership_cards_controller_1.MembershipCardsController],
        providers: [membership_cards_service_1.MembershipCardsService],
        exports: [membership_cards_service_1.MembershipCardsService],
    })
], MembershipCardsModule);
//# sourceMappingURL=membership-cards.module.js.map
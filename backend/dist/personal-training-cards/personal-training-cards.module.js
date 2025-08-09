"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalTrainingCardsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const personal_training_cards_controller_1 = require("../controllers/personal-training-cards.controller");
const personal_training_cards_service_1 = require("../services/personal-training-cards.service");
const personal_training_card_entity_1 = require("../entities/personal-training-card.entity");
const member_entity_1 = require("../entities/member.entity");
const membership_card_entity_1 = require("../entities/membership-card.entity");
const coach_entity_1 = require("../entities/coach.entity");
let PersonalTrainingCardsModule = class PersonalTrainingCardsModule {
};
exports.PersonalTrainingCardsModule = PersonalTrainingCardsModule;
exports.PersonalTrainingCardsModule = PersonalTrainingCardsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                personal_training_card_entity_1.PersonalTrainingCard,
                member_entity_1.Member,
                membership_card_entity_1.MembershipCard,
                coach_entity_1.Coach,
            ]),
        ],
        controllers: [personal_training_cards_controller_1.PersonalTrainingCardsController],
        providers: [personal_training_cards_service_1.PersonalTrainingCardsService],
        exports: [personal_training_cards_service_1.PersonalTrainingCardsService],
    })
], PersonalTrainingCardsModule);
//# sourceMappingURL=personal-training-cards.module.js.map
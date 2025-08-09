"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = exports.Booking = exports.CheckIn = exports.MembershipCard = exports.Course = exports.Coach = exports.Member = exports.Permission = exports.Role = exports.User = exports.Store = exports.Brand = exports.BaseEntity = void 0;
var base_entity_1 = require("./base.entity");
Object.defineProperty(exports, "BaseEntity", { enumerable: true, get: function () { return base_entity_1.BaseEntity; } });
var brand_entity_1 = require("./brand.entity");
Object.defineProperty(exports, "Brand", { enumerable: true, get: function () { return brand_entity_1.Brand; } });
var store_entity_1 = require("./store.entity");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return store_entity_1.Store; } });
var user_entity_1 = require("./user.entity");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_entity_1.User; } });
var role_entity_1 = require("./role.entity");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return role_entity_1.Role; } });
var permission_entity_1 = require("./permission.entity");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return permission_entity_1.Permission; } });
var member_entity_1 = require("./member.entity");
Object.defineProperty(exports, "Member", { enumerable: true, get: function () { return member_entity_1.Member; } });
var coach_entity_1 = require("./coach.entity");
Object.defineProperty(exports, "Coach", { enumerable: true, get: function () { return coach_entity_1.Coach; } });
var course_entity_1 = require("./course.entity");
Object.defineProperty(exports, "Course", { enumerable: true, get: function () { return course_entity_1.Course; } });
var membership_card_entity_1 = require("./membership-card.entity");
Object.defineProperty(exports, "MembershipCard", { enumerable: true, get: function () { return membership_card_entity_1.MembershipCard; } });
var check_in_entity_1 = require("./check-in.entity");
Object.defineProperty(exports, "CheckIn", { enumerable: true, get: function () { return check_in_entity_1.CheckIn; } });
var booking_entity_1 = require("./booking.entity");
Object.defineProperty(exports, "Booking", { enumerable: true, get: function () { return booking_entity_1.Booking; } });
const brand_entity_2 = require("./brand.entity");
const store_entity_2 = require("./store.entity");
const user_entity_2 = require("./user.entity");
const role_entity_2 = require("./role.entity");
const permission_entity_2 = require("./permission.entity");
const member_entity_2 = require("./member.entity");
const coach_entity_2 = require("./coach.entity");
const course_entity_2 = require("./course.entity");
const membership_card_entity_2 = require("./membership-card.entity");
const check_in_entity_2 = require("./check-in.entity");
const booking_entity_2 = require("./booking.entity");
exports.entities = [
    brand_entity_2.Brand,
    store_entity_2.Store,
    user_entity_2.User,
    role_entity_2.Role,
    permission_entity_2.Permission,
    member_entity_2.Member,
    coach_entity_2.Coach,
    course_entity_2.Course,
    membership_card_entity_2.MembershipCard,
    check_in_entity_2.CheckIn,
    booking_entity_2.Booking,
];
exports.default = exports.entities;
//# sourceMappingURL=index.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brand = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const store_entity_1 = require("./store.entity");
const user_entity_1 = require("./user.entity");
let Brand = class Brand extends base_entity_1.BaseEntity {
    name;
    code;
    description;
    logoUrl;
    contactPhone;
    contactEmail;
    address;
    settings;
    status;
    stores;
    users;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    getStoreCount() {
        return this.stores?.length || 0;
    }
};
exports.Brand = Brand;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '品牌名称',
    }),
    __metadata("design:type", String)
], Brand.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        unique: true,
        nullable: false,
        comment: '品牌代码，用于数据隔离',
    }),
    __metadata("design:type", String)
], Brand.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '品牌描述',
    }),
    __metadata("design:type", String)
], Brand.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '品牌Logo URL',
    }),
    __metadata("design:type", String)
], Brand.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        nullable: true,
        comment: '联系电话',
    }),
    __metadata("design:type", String)
], Brand.prototype, "contactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '联系邮箱',
    }),
    __metadata("design:type", String)
], Brand.prototype, "contactEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '品牌地址',
    }),
    __metadata("design:type", String)
], Brand.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '品牌配置信息',
    }),
    __metadata("design:type", Object)
], Brand.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
        comment: '品牌状态',
    }),
    __metadata("design:type", String)
], Brand.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => store_entity_1.Store, (store) => store.brand, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Brand.prototype, "stores", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.brand, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Brand.prototype, "users", void 0);
exports.Brand = Brand = __decorate([
    (0, typeorm_1.Entity)('brands'),
    (0, typeorm_1.Index)(['name'], { unique: true })
], Brand);
//# sourceMappingURL=brand.entity.js.map
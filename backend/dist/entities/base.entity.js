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
exports.BaseEntity = void 0;
const typeorm_1 = require("typeorm");
class BaseEntity {
    id;
    createdAt;
    updatedAt;
    deletedAt;
    createdBy;
    updatedBy;
    version;
}
exports.BaseEntity = BaseEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], BaseEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], BaseEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'timestamp with time zone',
        nullable: true,
    }),
    __metadata("design:type", Date)
], BaseEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'created_by',
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", String)
], BaseEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'updated_by',
        type: 'uuid',
        nullable: true,
    }),
    __metadata("design:type", String)
], BaseEntity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'version',
        type: 'int',
        default: 1,
    }),
    __metadata("design:type", Number)
], BaseEntity.prototype, "version", void 0);
//# sourceMappingURL=base.entity.js.map
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
exports.Permission = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const role_entity_1 = require("./role.entity");
let Permission = class Permission extends base_entity_1.BaseEntity {
    name;
    displayName;
    description;
    group;
    resource;
    action;
    type;
    status;
    settings;
    roles;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    isSystemPermission() {
        return this.type === 'system';
    }
    getRoleCount() {
        return this.roles?.length || 0;
    }
    getFullName() {
        return `${this.resource}:${this.action}`;
    }
    static createPermissionName(resource, action) {
        return `${resource}:${action}`;
    }
};
exports.Permission = Permission;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        unique: true,
        nullable: false,
        comment: '权限名称',
    }),
    __metadata("design:type", String)
], Permission.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '权限显示名称',
    }),
    __metadata("design:type", String)
], Permission.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '权限描述',
    }),
    __metadata("design:type", String)
], Permission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '权限分组',
    }),
    __metadata("design:type", String)
], Permission.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '资源标识',
    }),
    __metadata("design:type", String)
], Permission.prototype, "resource", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
        comment: '操作类型',
    }),
    __metadata("design:type", String)
], Permission.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['system', 'custom'],
        default: 'custom',
        comment: '权限类型',
    }),
    __metadata("design:type", String)
], Permission.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
        comment: '权限状态',
    }),
    __metadata("design:type", String)
], Permission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '权限配置信息',
    }),
    __metadata("design:type", Object)
], Permission.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => role_entity_1.Role, (role) => role.permissions),
    __metadata("design:type", Array)
], Permission.prototype, "roles", void 0);
exports.Permission = Permission = __decorate([
    (0, typeorm_1.Entity)('permissions'),
    (0, typeorm_1.Index)(['name'], { unique: true })
], Permission);
//# sourceMappingURL=permission.entity.js.map
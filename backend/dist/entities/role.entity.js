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
exports.Role = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const user_entity_1 = require("./user.entity");
const permission_entity_1 = require("./permission.entity");
let Role = class Role extends base_entity_1.BaseEntity {
    name;
    displayName;
    description;
    type;
    priority;
    status;
    settings;
    users;
    permissions;
    isActive() {
        return this.status === 'active' && !this.deletedAt;
    }
    hasPermission(permissionName) {
        return this.permissions?.some(permission => permission.name === permissionName && permission.isActive()) || false;
    }
    getPermissionNames() {
        return this.permissions?.map(permission => permission.name) || [];
    }
    isSystemRole() {
        return this.type === 'system';
    }
    getUserCount() {
        return this.users?.length || 0;
    }
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false,
        comment: '角色名称',
    }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: false,
        comment: '角色显示名称',
    }),
    __metadata("design:type", String)
], Role.prototype, "displayName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        nullable: true,
        comment: '角色描述',
    }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['system', 'custom'],
        default: 'custom',
        comment: '角色类型',
    }),
    __metadata("design:type", String)
], Role.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'int',
        default: 0,
        comment: '角色优先级（数字越大优先级越高）',
    }),
    __metadata("design:type", Number)
], Role.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
        comment: '角色状态',
    }),
    __metadata("design:type", String)
], Role.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'jsonb',
        nullable: true,
        comment: '角色配置信息',
    }),
    __metadata("design:type", Object)
], Role.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, (user) => user.roles),
    __metadata("design:type", Array)
], Role.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => permission_entity_1.Permission, (permission) => permission.roles, {
        cascade: true,
    }),
    (0, typeorm_1.JoinTable)({
        name: 'role_permissions',
        joinColumn: {
            name: 'role_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles'),
    (0, typeorm_1.Index)(['name'], { unique: true })
], Role);
//# sourceMappingURL=role.entity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = checkPermission;
exports.hasPermission = hasPermission;
const common_1 = require("@nestjs/common");
const PERMISSIONS = {
    'super-admin': {
        '*': ['create', 'read', 'update', 'delete'],
    },
    'brand-admin': {
        brand: ['read', 'update'],
        store: ['create', 'read', 'update', 'delete'],
        user: ['create', 'read', 'update', 'delete'],
        member: ['create', 'read', 'update', 'delete'],
        coach: ['create', 'read', 'update', 'delete'],
        course: ['create', 'read', 'update', 'delete'],
        booking: ['create', 'read', 'update', 'delete'],
        checkin: ['create', 'read', 'update', 'delete'],
        'membership-card': ['create', 'read', 'update', 'delete'],
    },
    'store-manager': {
        store: ['read', 'update'],
        user: ['read'],
        member: ['create', 'read', 'update', 'delete'],
        coach: ['create', 'read', 'update', 'delete'],
        course: ['create', 'read', 'update', 'delete'],
        booking: ['create', 'read', 'update', 'delete'],
        checkin: ['create', 'read', 'update', 'delete'],
        'membership-card': ['create', 'read', 'update', 'delete'],
    },
    coach: {
        member: ['read'],
        course: ['read'],
        booking: ['read', 'update'],
        checkin: ['create', 'read'],
        'membership-card': ['read'],
    },
    staff: {
        member: ['create', 'read', 'update'],
        course: ['read'],
        booking: ['create', 'read', 'update'],
        checkin: ['create', 'read'],
        'membership-card': ['create', 'read', 'update'],
    },
};
function checkPermission(userRole, resource, action) {
    if (userRole === 'super-admin') {
        return;
    }
    const rolePermissions = PERMISSIONS[userRole];
    if (!rolePermissions) {
        throw new common_1.ForbiddenException('无效的用户角色');
    }
    if (rolePermissions['*'] && rolePermissions['*'].includes(action)) {
        return;
    }
    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions || !resourcePermissions.includes(action)) {
        throw new common_1.ForbiddenException(`权限不足：无法对 ${resource} 执行 ${action} 操作`);
    }
}
function hasPermission(userRole, resource, action) {
    try {
        checkPermission(userRole, resource, action);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=permission.util.js.map
import { ForbiddenException } from '@nestjs/common';

// 权限映射表
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

/**
 * 检查用户权限
 * @param userRole 用户角色
 * @param resource 资源名称
 * @param action 操作类型
 */
export function checkPermission(
  userRole: string,
  resource: string,
  action: string,
): void {
  // 超级管理员拥有所有权限
  if (userRole === 'super-admin') {
    return;
  }

  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions) {
    throw new ForbiddenException('无效的用户角色');
  }

  // 检查通配符权限
  if (rolePermissions['*'] && rolePermissions['*'].includes(action)) {
    return;
  }

  // 检查具体资源权限
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions || !resourcePermissions.includes(action)) {
    throw new ForbiddenException(
      `权限不足：无法对 ${resource} 执行 ${action} 操作`,
    );
  }
}

/**
 * 检查用户是否有权限
 * @param userRole 用户角色
 * @param resource 资源名称
 * @param action 操作类型
 * @returns 是否有权限
 */
export function hasPermission(
  userRole: string,
  resource: string,
  action: string,
): boolean {
  try {
    checkPermission(userRole, resource, action);
    return true;
  } catch {
    return false;
  }
}

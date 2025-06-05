const jwt = require('jsonwebtoken');
const { query } = require('../config/database-sqlite');
const { unauthorized, forbidden } = require('../utils/response');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(unauthorized('未提供访问令牌'));
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查询用户信息
    const users = await query(
      'SELECT id, phone, name, role, team_id, status FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json(unauthorized('用户不存在或已被删除'));
    }

    const user = users[0];
    
    if (user.status !== 'active') {
      return res.status(401).json(unauthorized('用户账号已被停用'));
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      teamId: user.team_id
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(unauthorized('访问令牌无效'));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(unauthorized('访问令牌已过期'));
    }
    
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      timestamp: Date.now()
    });
  }
};

// 权限检查中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(unauthorized('用户未认证'));
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json(forbidden('权限不足'));
    }

    next();
  };
};

// 系统管理员权限（最高权限）
const requireAdmin = requireRole('admin');

// 总经理权限
const requireManager = requireRole('manager');

// 总经理及以上权限（包括系统管理员）
const requireManagerOrAbove = requireRole(['admin', 'manager']);

// 组长及以上权限
const requireLeaderOrAbove = requireRole(['admin', 'manager', 'leader']);

// 所有角色权限
const requireAnyRole = requireRole(['admin', 'manager', 'leader', 'sales']);

// 检查团队权限的中间件
const checkTeamPermission = async (req, res, next) => {
  try {
    const user = req.user;
    const targetTeamId = req.params.teamId || req.body.teamId || req.query.teamId;

    // 系统管理员和总经理有全部权限
    if (user.role === 'admin' || user.role === 'manager') {
      return next();
    }

    // 组长只能操作自己的团队
    if (user.role === 'leader') {
      if (!targetTeamId || parseInt(targetTeamId) !== user.teamId) {
        return res.status(403).json(forbidden('只能操作自己团队的数据'));
      }
      return next();
    }

    // 销售员只能操作自己的数据
    if (user.role === 'sales') {
      return res.status(403).json(forbidden('权限不足'));
    }

    next();
  } catch (error) {
    console.error('团队权限检查错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      timestamp: Date.now()
    });
  }
};

// 检查客户权限的中间件
const checkCustomerPermission = async (req, res, next) => {
  try {
    const user = req.user;
    const customerId = req.params.id || req.params.customerId;

    // 系统管理员和总经理有全部权限
    if (user.role === 'admin' || user.role === 'manager') {
      return next();
    }

    if (customerId) {
      // 查询客户信息
      const customers = await query(
        'SELECT owner_id, team_id FROM customers WHERE id = ? AND deleted_at IS NULL',
        [customerId]
      );

      if (customers.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '客户不存在',
          timestamp: Date.now()
        });
      }

      const customer = customers[0];

      // 组长可以操作本团队的客户
      if (user.role === 'leader') {
        if (customer.team_id !== user.teamId) {
          return res.status(403).json(forbidden('只能操作本团队的客户'));
        }
        return next();
      }

      // 销售员只能操作自己的客户
      if (user.role === 'sales') {
        if (customer.owner_id !== user.id) {
          return res.status(403).json(forbidden('只能操作自己的客户'));
        }
        return next();
      }
    }

    next();
  } catch (error) {
    console.error('客户权限检查错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      timestamp: Date.now()
    });
  }
};

// 检查用户权限的中间件
const checkUserPermission = async (req, res, next) => {
  try {
    const user = req.user;
    const targetUserId = req.params.id || req.params.userId;

    // 系统管理员有全部权限
    if (user.role === 'admin') {
      return next();
    }

    // 总经理不能操作系统管理员用户
    if (user.role === 'manager') {
      if (targetUserId) {
        const targetUser = await query(
          'SELECT role FROM users WHERE id = ? AND deleted_at IS NULL',
          [targetUserId]
        );
        
        if (targetUser.length > 0 && targetUser[0].role === 'admin') {
          return res.status(403).json(forbidden('无权操作系统管理员用户'));
        }
      }
      return next();
    }

    // 用户只能操作自己的信息
    if (targetUserId && parseInt(targetUserId) !== user.id) {
      return res.status(403).json(forbidden('只能操作自己的信息'));
    }

    next();
  } catch (error) {
    console.error('用户权限检查错误:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      timestamp: Date.now()
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManager,
  requireManagerOrAbove,
  requireLeaderOrAbove,
  requireAnyRole,
  checkTeamPermission,
  checkCustomerPermission,
  checkUserPermission
}; 
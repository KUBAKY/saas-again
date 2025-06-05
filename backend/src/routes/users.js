const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, requireRole, requireAdmin, requireManagerOrAbove } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// 用户数据验证规则
const userValidation = {
  create: {
    name: 'required|string|min:2|max:50',
    phone: 'required|string|regex:/^1[3-9]\d{9}$/',
    email: 'email|max:100',
    role: 'required|string|in:admin,manager,leader,sales',
    team_id: 'integer',
    password: 'string|min:6|max:20'
  },
  update: {
    name: 'string|min:2|max:50',
    phone: 'string|regex:/^1[3-9]\d{9}$/',
    email: 'email|max:100',
    role: 'string|in:admin,manager,leader,sales',
    team_id: 'integer',
    status: 'string|in:active,inactive'
  },
  resetPassword: {
    newPassword: 'required|string|min:6|max:20'
  }
};

// 获取销售员列表（用于下拉选择）
router.get('/sales', authenticateToken, UserController.getSalesList);

// 获取用户统计
router.get('/statistics', 
  authenticateToken, 
  requireManagerOrAbove, 
  UserController.getStatistics
);

// 获取用户列表
router.get('/', authenticateToken, requireManagerOrAbove, UserController.getList);

// 获取用户详情
router.get('/:id', authenticateToken, UserController.getById);

// 创建用户 - 只有系统管理员可以创建系统管理员，总经理可以创建其他角色
router.post('/', 
  authenticateToken, 
  requireManagerOrAbove, 
  validate(userValidation.create), 
  UserController.create
);

// 更新用户信息
router.put('/:id', 
  authenticateToken, 
  requireManagerOrAbove, 
  validate(userValidation.update), 
  UserController.update
);

// 删除用户 - 只有系统管理员可以删除系统管理员
router.delete('/:id', 
  authenticateToken, 
  requireManagerOrAbove, 
  UserController.delete
);

// 重置用户密码
router.put('/:id/password', 
  authenticateToken, 
  requireManagerOrAbove, 
  validate(userValidation.resetPassword), 
  UserController.resetPassword
);

module.exports = router; 
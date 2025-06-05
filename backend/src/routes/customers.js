const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// 客户数据验证规则
const customerValidation = {
  create: {
    name: 'required|string|min:2|max:50',
    phone: 'required|string|regex:/^1[3-9]\d{9}$/',
    email: 'email|max:100',
    company: 'string|max:100',
    position: 'string|max:50',
    address: 'string|max:200',
    source: 'string|max:50',
    level: 'integer|min:1|max:5',
    status: 'string|in:potential,contacted,interested,deal,invalid',
    assigned_to: 'integer',
    remark: 'string|max:500'
  },
  update: {
    name: 'string|min:2|max:50',
    phone: 'string|regex:/^1[3-9]\d{9}$/',
    email: 'email|max:100',
    company: 'string|max:100',
    position: 'string|max:50',
    address: 'string|max:200',
    source: 'string|max:50',
    level: 'integer|min:1|max:5',
    status: 'string|in:potential,contacted,interested,deal,invalid',
    assigned_to: 'integer',
    remark: 'string|max:500'
  }
};

// 获取客户列表
router.get('/', authenticateToken, CustomerController.getList);

// 获取客户详情
router.get('/:id', authenticateToken, CustomerController.getById);

// 创建客户
router.post('/', 
  authenticateToken, 
  (req, res, next) => {
    // 权限检查：只有管理员和经理可以创建客户
    if (req.user.role === 'sales' || req.user.role === 'leader') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，无法创建客户',
        timestamp: Date.now()
      });
    }
    next();
  },
  validate(customerValidation.create), 
  CustomerController.create
);

// 更新客户信息
router.put('/:id', 
  authenticateToken, 
  (req, res, next) => {
    // 权限检查：只有管理员和总经理可以编辑客户
    if (req.user.role === 'sales' || req.user.role === 'leader') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，无法编辑客户信息',
        timestamp: Date.now()
      });
    }
    next();
  },
  validate(customerValidation.update), 
  CustomerController.update
);

// 删除客户
router.delete('/:id', 
  authenticateToken, 
  requireRole(['manager', 'leader']), 
  CustomerController.delete
);

// 转移客户
router.post('/transfer', 
  authenticateToken, 
  requireRole(['manager', 'leader']), 
  CustomerController.transfer
);

// 批量导入客户
router.post('/import', 
  authenticateToken, 
  (req, res, next) => {
    // 权限检查：只有管理员和经理可以批量导入客户
    if (req.user.role === 'sales' || req.user.role === 'leader') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，无法批量导入客户',
        timestamp: Date.now()
      });
    }
    next();
  },
  CustomerController.batchImport
);

// 获取客户统计数据
router.get('/statistics/overview', 
  authenticateToken, 
  CustomerController.getStatistics
);

module.exports = router; 
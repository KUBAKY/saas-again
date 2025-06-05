const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// 团队数据验证规则
const teamValidation = {
  create: {
    name: 'required|string|min:2|max:50',
    description: 'string|max:200',
    level: 'required|integer|min:1|max:5',
    leader_id: 'integer',
    target_amount: 'numeric|min:0'
  },
  update: {
    name: 'string|min:2|max:50',
    description: 'string|max:200',
    level: 'integer|min:1|max:5',
    leader_id: 'integer',
    target_amount: 'numeric|min:0',
    status: 'string|in:active,inactive'
  }
};

// 获取所有团队（用于下拉选择）
router.get('/all', authenticateToken, TeamController.getAll);

// 获取团队列表
router.get('/', authenticateToken, requireRole(['manager']), TeamController.getList);

// 获取团队详情
router.get('/:id', authenticateToken, TeamController.getById);

// 创建团队
router.post('/', 
  authenticateToken, 
  requireRole(['manager']), 
  validate(teamValidation.create), 
  TeamController.create
);

// 更新团队信息
router.put('/:id', 
  authenticateToken, 
  requireRole(['manager']), 
  validate(teamValidation.update), 
  TeamController.update
);

// 删除团队
router.delete('/:id', 
  authenticateToken, 
  requireRole(['manager']), 
  TeamController.delete
);

// 获取团队成员列表
router.get('/:id/members', authenticateToken, TeamController.getMembers);

// 添加团队成员
router.post('/:id/members', 
  authenticateToken, 
  requireRole(['manager']), 
  TeamController.addMember
);

// 移除团队成员
router.delete('/:id/members', 
  authenticateToken, 
  requireRole(['manager']), 
  TeamController.removeMember
);

// 获取团队统计数据
router.get('/:id/statistics', authenticateToken, TeamController.getStatistics);

module.exports = router; 
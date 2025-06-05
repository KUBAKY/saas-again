const express = require('express');
const router = express.Router();
const FollowRecordController = require('../controllers/followRecordController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../utils/validation');

// 跟进记录数据验证规则
const followRecordValidation = {
  create: {
    customer_id: 'required|integer',
    content: 'required|string|min:5|max:1000',
    follow_type: 'required|string|in:phone,email,visit,wechat,other',
    next_follow_time: 'date',
    remark: 'string|max:500'
  },
  update: {
    content: 'string|min:5|max:1000',
    follow_type: 'string|in:phone,email,visit,wechat,other',
    next_follow_time: 'date',
    remark: 'string|max:500'
  }
};

// 获取跟进记录列表
router.get('/', authenticateToken, FollowRecordController.getList);

// 获取跟进记录详情
router.get('/:id', authenticateToken, FollowRecordController.getById);

// 创建跟进记录
router.post('/', 
  authenticateToken, 
  validate(followRecordValidation.create), 
  FollowRecordController.create
);

// 更新跟进记录
router.put('/:id', 
  authenticateToken, 
  validate(followRecordValidation.update), 
  FollowRecordController.update
);

// 删除跟进记录
router.delete('/:id', authenticateToken, FollowRecordController.delete);

// 获取客户的跟进记录
router.get('/customer/:customerId', authenticateToken, FollowRecordController.getByCustomerId);

// 获取跟进统计数据
router.get('/statistics/overview', authenticateToken, FollowRecordController.getStatistics);

// 获取待跟进客户列表
router.get('/pending/followups', authenticateToken, FollowRecordController.getPendingFollowUps);

module.exports = router; 
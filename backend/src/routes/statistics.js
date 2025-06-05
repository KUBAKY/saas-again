const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statisticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// 获取总体统计概览
router.get('/overview', authenticateToken, StatisticsController.getOverview);

// 获取客户统计数据
router.get('/customers', authenticateToken, StatisticsController.getCustomerStatistics);

// 获取跟进记录统计数据
router.get('/follow-records', authenticateToken, StatisticsController.getFollowRecordStatistics);

// 获取团队统计数据
router.get('/teams', 
  authenticateToken, 
  requireRole(['manager', 'leader']), 
  StatisticsController.getTeamStatistics
);

// 获取用户绩效统计
router.get('/users', 
  authenticateToken, 
  requireRole(['admin', 'manager', 'leader']), 
  StatisticsController.getUserPerformance
);

// 获取待跟进提醒
router.get('/pending-reminders', authenticateToken, StatisticsController.getPendingReminders);

// 获取数据趋势分析
router.get('/trends', authenticateToken, StatisticsController.getTrendAnalysis);

module.exports = router; 
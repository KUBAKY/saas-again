const express = require('express');
const { query } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth-sqlite');

const router = express.Router();

// 获取跟进记录列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, customerId = '', salesId = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const { user } = req;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    // 权限控制
    if (user.role === 'sales') {
      whereClause += ' AND fr.sales_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND c.team_id = ?';
      params.push(user.team_id);
    }
    
    if (customerId) {
      whereClause += ' AND fr.customer_id = ?';
      params.push(customerId);
    }
    
    if (salesId) {
      whereClause += ' AND fr.sales_id = ?';
      params.push(salesId);
    }
    
    // 获取跟进记录列表
    const records = await query(`
      SELECT 
        fr.*,
        c.name as customer_name,
        c.phone as customer_phone,
        u.name as sales_name
      FROM follow_records fr
      LEFT JOIN customers c ON fr.customer_id = c.id
      LEFT JOIN users u ON fr.sales_id = u.id
      ${whereClause}
      ORDER BY fr.follow_time DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(pageSize), offset]);
    
    // 获取总数
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM follow_records fr
      LEFT JOIN customers c ON fr.customer_id = c.id
      ${whereClause}
    `, params);
    
    const total = countResult[0].total;
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: records,
        pagination: {
          total,
          current: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取跟进记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取跟进记录失败',
      timestamp: Date.now()
    });
  }
});

// 创建跟进记录
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customerId, content, followTime } = req.body;
    const { user } = req;
    
    // 验证必填字段
    if (!customerId || !content || !followTime) {
      return res.status(400).json({
        code: 400,
        message: '客户ID、跟进内容和跟进时间为必填项',
        timestamp: Date.now()
      });
    }
    
    // 验证跟进时间是否在过去72小时内
    const followDate = new Date(followTime);
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    
    if (isNaN(followDate.getTime())) {
      return res.status(400).json({
        code: 400,
        message: '跟进时间格式无效',
        timestamp: Date.now()
      });
    }
    
    if (followDate > now) {
      return res.status(400).json({
        code: 400,
        message: '跟进时间不能是未来时间',
        timestamp: Date.now()
      });
    }
    
    if (followDate < seventyTwoHoursAgo) {
      return res.status(400).json({
        code: 400,
        message: '跟进时间不能超过72小时前',
        timestamp: Date.now()
      });
    }
    
    // 创建跟进记录
    const result = await query(`
      INSERT INTO follow_records (customer_id, sales_id, content, follow_time, created_at)
      VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
    `, [customerId, user.id, content, followTime]);
    
    // 更新客户的最后跟进时间和跟进次数
    await query(`
      UPDATE customers 
      SET last_follow_time = ?, follow_count = follow_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [followTime, customerId]);
    
    res.json({
      code: 200,
      message: '创建成功',
      data: { id: result.lastID },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建跟进记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建跟进记录失败',
      timestamp: Date.now()
    });
  }
});

module.exports = router; 
const express = require('express');
const { query } = require('../config/database-sqlite');
const { authenticateToken } = require('../middleware/auth-sqlite');

const router = express.Router();

// 获取总体统计数据
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const { startDate, endDate, teamId } = req.query;
    
    console.log('统计请求 - 当前用户:', { id: user.id, phone: user.phone, name: user.name, role: user.role, teamId: user.teamId });
    console.log('查询参数:', { startDate, endDate, teamId });
    
    // 获取总客户数（不受日期范围限制）
    let customerWhereClause = 'WHERE deleted_at IS NULL';
    let customerParams = [];
    
    // 权限控制
    if (user.role === 'sales') {
      customerWhereClause += ' AND owner_id = ?';
      customerParams.push(user.id);
    } else if (user.role === 'leader') {
      customerWhereClause += ' AND team_id = ?';
      customerParams.push(user.teamId);
    } else if (teamId) {
      customerWhereClause += ' AND team_id = ?';
      customerParams.push(teamId);
    }
    
    console.log('客户查询条件:', customerWhereClause);
    console.log('客户查询参数:', customerParams);
    
    const totalCustomersResult = await query(`
      SELECT COUNT(*) as total FROM customers ${customerWhereClause}
    `, customerParams);
    
    console.log('客户查询结果:', totalCustomersResult);
    
    // 获取今日新增客户数
    const todayAddedResult = await query(`
      SELECT COUNT(*) as total FROM customers 
      WHERE deleted_at IS NULL 
      AND DATE(created_at) = DATE('now')
      ${user.role === 'sales' ? 'AND owner_id = ?' : 
        user.role === 'leader' ? 'AND team_id = ?' : ''}
    `, user.role !== 'manager' && user.role !== 'admin' ? [user.role === 'sales' ? user.id : user.teamId] : []);
    
    // 获取总跟进记录数
    let followWhereClause = 'WHERE 1=1';
    let followParams = [];
    
    if (user.role === 'sales') {
      followWhereClause += ' AND sales_id = ?';
      followParams.push(user.id);
    } else if (user.role === 'leader') {
      followWhereClause += ' AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)';
      followParams.push(user.teamId);
    } else if (teamId) {
      followWhereClause += ' AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)';
      followParams.push(teamId);
    }
    
    if (startDate) {
      followWhereClause += ' AND DATE(follow_time) >= ?';
      followParams.push(startDate);
    }
    if (endDate) {
      followWhereClause += ' AND DATE(follow_time) <= ?';
      followParams.push(endDate);
    }
    
    const totalFollowRecordsResult = await query(`
      SELECT COUNT(*) as total FROM follow_records ${followWhereClause}
    `, followParams);
    
    // 获取今日跟进数
    const todayFollowResult = await query(`
      SELECT COUNT(*) as total FROM follow_records 
      WHERE DATE(follow_time) = DATE('now')
      ${user.role === 'sales' ? 'AND sales_id = ?' : 
        user.role === 'leader' ? 'AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)' : ''}
    `, user.role !== 'manager' && user.role !== 'admin' ? [user.role === 'sales' ? user.id : user.teamId] : []);
    
    // 获取活跃用户数
    const activeUsersResult = await query(`
      SELECT COUNT(DISTINCT sales_id) as total FROM follow_records 
      WHERE DATE(follow_time) >= DATE('now', '-7 days')
      ${user.role === 'sales' ? 'AND sales_id = ?' : 
        user.role === 'leader' ? 'AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)' : ''}
    `, user.role !== 'manager' && user.role !== 'admin' ? [user.role === 'sales' ? user.id : user.teamId] : []);
    
    // 获取小组统计数据
    let teamStats = [];
    if (user.role === 'manager' || user.role === 'admin') {
      const teamStatsResult = await query(`
        SELECT 
          t.id as teamId,
          t.name as teamName,
          COUNT(DISTINCT c.id) as customerCount,
          COUNT(DISTINCT fr.id) as followCount,
          COUNT(DISTINCT fr.sales_id) as activeUserCount
        FROM teams t
        LEFT JOIN customers c ON t.id = c.team_id AND c.deleted_at IS NULL
        LEFT JOIN follow_records fr ON c.id = fr.customer_id
        WHERE t.deleted_at IS NULL
        GROUP BY t.id, t.name
        ORDER BY customerCount DESC
      `);
      teamStats = teamStatsResult;
    }
    
    // 获取用户统计数据
    let userStatsQuery = `
      SELECT 
        u.id as userId,
        u.name as userName,
        u.role as userRole,
        t.name as teamName,
        COUNT(DISTINCT c.id) as customerCount,
        COUNT(DISTINCT fr.id) as followCount
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN customers c ON u.id = c.owner_id AND c.deleted_at IS NULL
      LEFT JOIN follow_records fr ON c.id = fr.customer_id
      WHERE u.deleted_at IS NULL
    `;
    
    let userStatsParams = [];
    
    if (user.role === 'sales') {
      // 销售员只能看自己
      userStatsQuery += ' AND u.id = ?';
      userStatsParams.push(user.id);
    } else if (user.role === 'leader') {
      // 组长可以看到本小组所有成员（包括自己）
      userStatsQuery += ' AND u.team_id = ?';
      userStatsParams.push(user.teamId);
    } else if (user.role === 'manager' || user.role === 'admin') {
      // 管理员可以看所有销售员
      if (teamId) {
        userStatsQuery += ' AND u.team_id = ?';
        userStatsParams.push(teamId);
      } else {
        userStatsQuery += ' AND u.role IN (?, ?)';
        userStatsParams.push('sales', 'leader');
      }
    }
    
    userStatsQuery += ' GROUP BY u.id, u.name, u.role, t.name ORDER BY customerCount DESC';
    
    const userStats = await query(userStatsQuery, userStatsParams);
    
    res.json({
      code: 200,
      message: '获取统计数据成功',
      data: {
        totalCustomers: totalCustomersResult[0].total,
        totalFollowRecords: totalFollowRecordsResult[0].total,
        todayFollowCount: todayFollowResult[0].total,
        todayAdded: todayAddedResult[0].total,
        activeUsers: activeUsersResult[0].total,
        teamStats,
        userStats
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计数据失败',
      timestamp: Date.now()
    });
  }
});

// 获取总体统计概览
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    
    let whereClause = '';
    let params = [];
    
    // 权限控制
    if (user.role === 'sales') {
      whereClause = 'WHERE owner_id = ? AND deleted_at IS NULL';
      params = [user.id];
    } else if (user.role === 'leader') {
      whereClause = 'WHERE team_id = ? AND deleted_at IS NULL';
      params = [user.teamId];
    } else {
      whereClause = 'WHERE deleted_at IS NULL';
    }
    
    // 获取客户总数
    const customerCount = await query(`
      SELECT COUNT(*) as total FROM customers ${whereClause}
    `, params);
    
    // 获取今日跟进数
    const todayFollowCount = await query(`
      SELECT COUNT(*) as total FROM follow_records 
      WHERE DATE(follow_time) = DATE('now')
      ${user.role === 'sales' ? 'AND sales_id = ?' : 
        user.role === 'leader' ? 'AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)' : ''}
    `, user.role !== 'manager' && user.role !== 'admin' ? [user.role === 'sales' ? user.id : user.teamId] : []);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        customerCount: customerCount[0].total,
        todayFollowCount: todayFollowCount[0].total,
        teamCount: user.role === 'manager' ? 1 : 0,
        userCount: user.role === 'manager' ? 3 : 1
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取统计概览失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计概览失败',
      timestamp: Date.now()
    });
  }
});

// 获取跟进统计数据
router.get('/follow-stats', authenticateToken, async (req, res) => {
  try {
    const { user } = req;
    const { startDate, endDate, teamId } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    
    // 权限控制
    if (user.role === 'sales') {
      whereClause += ' AND sales_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)';
      params.push(user.teamId);
    } else if (teamId) {
      whereClause += ' AND customer_id IN (SELECT id FROM customers WHERE team_id = ? AND deleted_at IS NULL)';
      params.push(teamId);
    }
    
    // 日期范围过滤
    if (startDate) {
      whereClause += ' AND DATE(follow_time) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND DATE(follow_time) <= ?';
      params.push(endDate);
    }
    
    // 获取跟进统计数据
    const followStats = await query(`
      SELECT 
        COUNT(*) as totalFollowCount,
        COUNT(DISTINCT customer_id) as totalCustomerCount,
        COUNT(DISTINCT sales_id) as activeSalesCount
      FROM follow_records ${whereClause}
    `, params);
    
    res.json({
      code: 200,
      message: '获取跟进统计成功',
      data: {
        summary: {
          totalFollowCount: followStats[0].totalFollowCount,
          totalCustomerCount: followStats[0].totalCustomerCount,
          activeTeamCount: 1,
          activeSalesCount: followStats[0].activeSalesCount
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取跟进统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取跟进统计失败',
      timestamp: Date.now()
    });
  }
});

module.exports = router; 
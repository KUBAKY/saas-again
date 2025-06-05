const express = require('express');
const { query } = require('../config/database-sqlite');
const { authenticateToken, requireManagerOrAbove } = require('../middleware/auth-sqlite');

const router = express.Router();

// 获取所有团队（下拉选择用）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const teams = await query(
      'SELECT id, name FROM teams WHERE deleted_at IS NULL ORDER BY name'
    );
    
    res.json({
      code: 200,
      message: '获取成功',
      data: teams,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取团队列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取团队列表失败',
      timestamp: Date.now()
    });
  }
});

// 获取团队列表
router.get('/', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search = '', level = '', isFull = '' } = req.query;
    const offset = (page - 1) * pageSize;
    
    let whereClause = 'WHERE t.deleted_at IS NULL';
    let params = [];
    
    if (search) {
      whereClause += ' AND t.name LIKE ?';
      params.push(`%${search}%`);
    }
    
    if (level) {
      whereClause += ' AND t.level = ?';
      params.push(level);
    }
    
    if (isFull === 'true') {
      whereClause += ' AND (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = "sales") >= t.max_members';
    } else if (isFull === 'false') {
      whereClause += ' AND (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = "sales") < t.max_members';
    }
    
    // 获取团队列表
    const teams = await query(`
      SELECT 
        t.id,
        t.name,
        t.level,
        t.leader_id as leaderId,
        t.member_count as memberCount,
        t.max_members as maxMembers,
        t.description,
        t.created_at as createdAt,
        t.updated_at as updatedAt,
        t.deleted_at as deletedAt,
        u.name as leaderName,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'sales') as salesCount,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'leader') as leaderCount
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(pageSize), offset]);
    
    // 获取总数
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM teams t
      ${whereClause}
    `, params);
    
    const total = countResult[0].total;
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: teams,
        pagination: {
          total,
          current: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取团队列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取团队列表失败',
      timestamp: Date.now()
    });
  }
});

// 创建团队
router.post('/', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { name, level, leaderId, description } = req.body;
    
    // 验证必填字段
    if (!name || !level) {
      return res.status(400).json({
        code: 400,
        message: '团队名称和等级为必填项',
        timestamp: Date.now()
      });
    }
    
    // 设置最大成员数
    const maxMembersMap = {
      '4': 4,
      '10': 10,
      '15': 15,
      '30': 30
    };
    const maxMembers = maxMembersMap[level];
    
    // 检查团队名称是否已存在
    const existingTeam = await query(
      'SELECT id FROM teams WHERE name = ? AND deleted_at IS NULL',
      [name]
    );
    
    if (existingTeam.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '团队名称已存在',
        timestamp: Date.now()
      });
    }
    
    // 如果指定了组长，检查该组长是否已经是其他团队的组长
    if (leaderId) {
      const existingLeader = await query(
        'SELECT id, name FROM teams WHERE leader_id = ? AND deleted_at IS NULL',
        [leaderId]
      );
      
      if (existingLeader.length > 0) {
        return res.status(400).json({
          code: 400,
          message: `该组长已经是"${existingLeader[0].name}"团队的组长，一个组长只能带领一个团队`,
          timestamp: Date.now()
        });
      }
    }
    
    // 创建团队
    const result = await query(`
      INSERT INTO teams (name, level, leader_id, max_members, description)
      VALUES (?, ?, ?, ?, ?)
    `, [name, level, leaderId || null, maxMembers, description || null]);
    
    const teamId = result.insertId;
    
    // 如果指定了组长，更新用户的team_id
    if (leaderId) {
      await query(
        'UPDATE users SET team_id = ? WHERE id = ?',
        [teamId, leaderId]
      );
      
      // 更新团队成员数量
      await query(
        'UPDATE teams SET member_count = 1 WHERE id = ?',
        [teamId]
      );
    }
    
    res.json({
      code: 200,
      message: '创建成功',
      data: { id: teamId },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建团队失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建团队失败',
      timestamp: Date.now()
    });
  }
});

// 获取团队详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await query(`
      SELECT 
        t.id,
        t.name,
        t.level,
        t.leader_id as leaderId,
        t.member_count as memberCount,
        t.max_members as maxMembers,
        t.description,
        t.created_at as createdAt,
        t.updated_at as updatedAt,
        t.deleted_at as deletedAt,
        u.name as leaderName,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'sales') as salesCount,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'leader') as leaderCount
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.id = ? AND t.deleted_at IS NULL
    `, [id]);
    
    if (team.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '团队不存在',
        timestamp: Date.now()
      });
    }
    
    res.json({
      code: 200,
      message: '获取成功',
      data: team[0],
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取团队详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取团队详情失败',
      timestamp: Date.now()
    });
  }
});

// 更新团队
router.put('/:id', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, leaderId } = req.body;
    
    // 添加调试日志
    console.log('更新团队请求 - ID:', id);
    console.log('更新团队请求 - 请求体:', req.body);
    console.log('更新团队请求 - 解析字段:', { name, level, leaderId });
    
    // 验证必填字段
    if (!name || !name.trim()) {
      return res.status(400).json({
        code: 400,
        message: '小组名称不能为空',
        timestamp: Date.now()
      });
    }
    
    if (!level || !['4', '10', '15', '30'].includes(level)) {
      return res.status(400).json({
        code: 400,
        message: '请选择有效的小组等级',
        timestamp: Date.now()
      });
    }
    
    // 检查团队是否存在
    const existingTeam = await query(
      'SELECT * FROM teams WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (existingTeam.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '团队不存在',
        timestamp: Date.now()
      });
    }
    
    // 检查团队名称是否已被其他团队使用
    const nameCheck = await query(
      'SELECT id FROM teams WHERE name = ? AND id != ? AND deleted_at IS NULL',
      [name.trim(), id]
    );
    
    if (nameCheck.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '小组名称已存在',
        timestamp: Date.now()
      });
    }
    
    // 如果指定了组长，检查该组长是否已经是其他团队的组长
    if (leaderId) {
      const existingLeader = await query(
        'SELECT id, name FROM teams WHERE leader_id = ? AND id != ? AND deleted_at IS NULL',
        [leaderId, id]
      );
      
      if (existingLeader.length > 0) {
        return res.status(400).json({
          code: 400,
          message: `该组长已经是"${existingLeader[0].name}"团队的组长，一个组长只能带领一个团队`,
          timestamp: Date.now()
        });
      }
    }
    
    // 设置最大成员数
    const maxMembersMap = {
      '4': 4,
      '10': 10,
      '15': 15,
      '30': 30
    };
    const maxMembers = maxMembersMap[level];
    
    const oldTeam = existingTeam[0];
    
    // 更新团队信息
    await query(`
      UPDATE teams 
      SET name = ?, level = ?, leader_id = ?, max_members = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name.trim(), level, leaderId || null, maxMembers, id]);
    
    // 如果组长发生变化，需要更新用户的team_id
    if (oldTeam.leader_id !== leaderId) {
      // 移除旧组长的team_id
      if (oldTeam.leader_id) {
        await query(
          'UPDATE users SET team_id = NULL WHERE id = ?',
          [oldTeam.leader_id]
        );
      }
      
      // 设置新组长的team_id
      if (leaderId) {
        await query(
          'UPDATE users SET team_id = ? WHERE id = ?',
          [id, leaderId]
        );
      }
      
      // 重新计算成员数量
      const memberCount = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
        [id]
      );
      
      await query(
        'UPDATE teams SET member_count = ? WHERE id = ?',
        [memberCount[0].count, id]
      );
    }
    
    res.json({
      code: 200,
      message: '更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新团队失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新团队失败',
      timestamp: Date.now()
    });
  }
});

// 批量删除团队
router.delete('/batch/:ids', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { ids } = req.params;
    const teamIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (teamIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供有效的团队ID列表',
        timestamp: Date.now()
      });
    }
    
    // 检查所有团队是否存在
    const placeholders = teamIds.map(() => '?').join(',');
    const existingTeams = await query(
      `SELECT id, name FROM teams WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      teamIds
    );
    
    if (existingTeams.length !== teamIds.length) {
      const existingIds = existingTeams.map(team => team.id);
      const notFoundIds = teamIds.filter(id => !existingIds.includes(id));
      return res.status(404).json({
        code: 404,
        message: `团队不存在: ${notFoundIds.join(', ')}`,
        timestamp: Date.now()
      });
    }
    
    // 检查是否有团队还有成员
    const teamsWithMembers = await query(
      `SELECT t.id, t.name, COUNT(u.id) as memberCount 
       FROM teams t 
       LEFT JOIN users u ON t.id = u.team_id AND u.deleted_at IS NULL
       WHERE t.id IN (${placeholders}) AND t.deleted_at IS NULL
       GROUP BY t.id, t.name
       HAVING COUNT(u.id) > 0`,
      teamIds
    );
    
    if (teamsWithMembers.length > 0) {
      const teamNames = teamsWithMembers.map(team => `${team.name}(${team.memberCount}人)`);
      return res.status(400).json({
        code: 400,
        message: `以下团队中还有成员，无法删除: ${teamNames.join(', ')}`,
        timestamp: Date.now()
      });
    }
    
    // 批量软删除团队
    await query(
      `UPDATE teams SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      teamIds
    );
    
    res.json({
      code: 200,
      message: `成功删除 ${teamIds.length} 个团队`,
      data: {
        deletedCount: teamIds.length,
        deletedIds: teamIds
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量删除团队失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除团队失败',
      timestamp: Date.now()
    });
  }
});

// 批量调整小组等级
router.put('/batch/level', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { teamIds, level } = req.body;
    
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供有效的团队ID列表',
        timestamp: Date.now()
      });
    }
    
    if (!level || !['4', '10', '15', '30'].includes(level)) {
      return res.status(400).json({
        code: 400,
        message: '请提供有效的小组等级',
        timestamp: Date.now()
      });
    }
    
    // 设置最大成员数
    const maxMembersMap = {
      '4': 4,
      '10': 10,
      '15': 15,
      '30': 30
    };
    const maxMembers = maxMembersMap[level];
    
    // 检查所有团队是否存在，并获取销售员数量
    const placeholders = teamIds.map(() => '?').join(',');
    const existingTeams = await query(
      `SELECT 
        t.id, 
        t.name, 
        t.member_count,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'sales') as sales_count
       FROM teams t 
       WHERE t.id IN (${placeholders}) AND t.deleted_at IS NULL`,
      teamIds
    );
    
    if (existingTeams.length !== teamIds.length) {
      const existingIds = existingTeams.map(team => team.id);
      const notFoundIds = teamIds.filter(id => !existingIds.includes(id));
      return res.status(404).json({
        code: 404,
        message: `团队不存在: ${notFoundIds.join(', ')}`,
        timestamp: Date.now()
      });
    }
    
    // 检查是否有团队的销售员数量超过新等级的限制
    const overflowTeams = existingTeams.filter(team => team.sales_count > maxMembers);
    if (overflowTeams.length > 0) {
      const teamNames = overflowTeams.map(team => `${team.name}(${team.sales_count}名销售员)`);
      return res.status(400).json({
        code: 400,
        message: `以下团队的销售员数量超过新等级限制，无法调整: ${teamNames.join(', ')}`,
        timestamp: Date.now()
      });
    }
    
    // 批量更新团队等级
    await query(
      `UPDATE teams SET level = ?, max_members = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      [level, maxMembers, ...teamIds]
    );
    
    res.json({
      code: 200,
      message: `成功调整 ${teamIds.length} 个团队的等级为 ${level}人小组`,
      data: {
        updatedCount: teamIds.length,
        updatedIds: teamIds,
        newLevel: level,
        newMaxMembers: maxMembers
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量调整团队等级失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量调整团队等级失败',
      timestamp: Date.now()
    });
  }
});

// 删除团队
router.delete('/:id', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查团队是否存在
    const existingTeam = await query(
      'SELECT * FROM teams WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (existingTeam.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '团队不存在',
        timestamp: Date.now()
      });
    }
    
    // 检查是否有成员
    const members = await query(
      'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (members[0].count > 0) {
      return res.status(400).json({
        code: 400,
        message: '团队中还有成员，无法删除',
        timestamp: Date.now()
      });
    }
    
    // 软删除团队
    await query(
      'UPDATE teams SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({
      code: 200,
      message: '删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除团队失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除团队失败',
      timestamp: Date.now()
    });
  }
});

// 获取团队成员列表
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查团队是否存在
    const existingTeam = await query(
      'SELECT * FROM teams WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (existingTeam.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '团队不存在',
        timestamp: Date.now()
      });
    }
    
    // 获取团队成员
    const members = await query(`
      SELECT 
        u.id,
        u.name,
        u.phone,
        u.role,
        u.join_date,
        u.status,
        u.created_at
      FROM users u
      WHERE u.team_id = ? AND u.deleted_at IS NULL
      ORDER BY u.role, u.created_at
    `, [id]);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: members,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取团队成员失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取团队成员失败',
      timestamp: Date.now()
    });
  }
});

// 添加成员到团队
router.post('/:id/members', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '用户ID为必填项',
        timestamp: Date.now()
      });
    }
    
    // 检查团队是否存在
    const existingTeam = await query(
      'SELECT * FROM teams WHERE id = ? AND deleted_at IS NULL',
      [teamId]
    );
    
    if (existingTeam.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '团队不存在',
        timestamp: Date.now()
      });
    }
    
    const team = existingTeam[0];
    
    // 检查用户是否存在
    const existingUser = await query(
      'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: Date.now()
      });
    }
    
    const user = existingUser[0];
    
    // 检查用户是否已经在其他团队中
    if (user.team_id && user.team_id !== parseInt(teamId)) {
      return res.status(400).json({
        code: 400,
        message: '用户已经在其他团队中',
        timestamp: Date.now()
      });
    }
    
    // 检查用户是否已经在当前团队中
    if (user.team_id === parseInt(teamId)) {
      return res.status(400).json({
        code: 400,
        message: '用户已经在当前团队中',
        timestamp: Date.now()
      });
    }
    
    // 如果要添加的是销售员，检查销售员数量是否已满
    if (user.role === 'sales') {
      // 计算当前团队中销售员的数量
      const salesCount = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND role = "sales" AND deleted_at IS NULL',
        [teamId]
      );
      
      if (salesCount[0].count >= team.max_members) {
        return res.status(400).json({
          code: 400,
          message: `团队销售员已满，最多可容纳${team.max_members}名销售员`,
          timestamp: Date.now()
        });
      }
    }
    
    // 如果要添加的是组长，检查团队中是否已经有组长
    if (user.role === 'leader') {
      const existingLeaders = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND role = "leader" AND deleted_at IS NULL',
        [teamId]
      );
      
      if (existingLeaders[0].count > 0) {
        return res.status(400).json({
          code: 400,
          message: '团队中已经有组长，一个团队只能有一个组长',
          timestamp: Date.now()
        });
      }
      
      // 设置为团队组长
      await query(
        'UPDATE teams SET leader_id = ? WHERE id = ?',
        [userId, teamId]
      );
    }
    
    // 将用户添加到团队
    await query(
      'UPDATE users SET team_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [teamId, userId]
    );
    
    // 重新计算团队成员数量（包括所有成员）
    const totalMemberCount = await query(
      'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
      [teamId]
    );
    
    await query(
      'UPDATE teams SET member_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [totalMemberCount[0].count, teamId]
    );
    
    res.json({
      code: 200,
      message: '成功添加团队成员',
      data: {
        teamId: parseInt(teamId),
        userId: parseInt(userId),
        userName: user.name
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('添加团队成员失败:', error);
    res.status(500).json({
      code: 500,
      message: '添加团队成员失败',
      timestamp: Date.now()
    });
  }
});

// 移除团队成员
router.delete('/:id/members/:userId', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id: teamId, userId } = req.params;
    
    // 检查团队是否存在
    const existingTeam = await query(
      'SELECT * FROM teams WHERE id = ? AND deleted_at IS NULL',
      [teamId]
    );
    
    if (existingTeam.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '团队不存在',
        timestamp: Date.now()
      });
    }
    
    // 检查用户是否存在且在该团队中
    const existingUser = await query(
      'SELECT * FROM users WHERE id = ? AND team_id = ? AND deleted_at IS NULL',
      [userId, teamId]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在或不在该团队中',
        timestamp: Date.now()
      });
    }
    
    const user = existingUser[0];
    const team = existingTeam[0];
    
    // 如果是组长，需要特殊处理
    if (user.role === 'leader') {
      // 检查团队中是否还有其他成员
      const otherMembers = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND id != ? AND deleted_at IS NULL',
        [teamId, userId]
      );
      
      if (otherMembers[0].count > 0) {
        return res.status(400).json({
          code: 400,
          message: '组长不能被移除，团队中还有其他成员。请先转移其他成员或指定新组长。',
          timestamp: Date.now()
        });
      }
      
      // 如果是唯一成员，清除团队的组长ID
      if (team.leader_id === parseInt(userId)) {
        await query(
          'UPDATE teams SET leader_id = NULL WHERE id = ?',
          [teamId]
        );
      }
    }
    
    // 将用户从团队中移除（设置team_id为NULL）
    await query(
      'UPDATE users SET team_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
    
    // 重新计算团队成员数量（包括所有成员）
    const totalMemberCount = await query(
      'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
      [teamId]
    );
    
    await query(
      'UPDATE teams SET member_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [totalMemberCount[0].count, teamId]
    );
    
    res.json({
      code: 200,
      message: '成功移除团队成员',
      data: {
        teamId: parseInt(teamId),
        userId: parseInt(userId),
        userName: user.name
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('移除团队成员失败:', error);
    res.status(500).json({
      code: 500,
      message: '移除团队成员失败',
      timestamp: Date.now()
    });
  }
});

module.exports = router; 
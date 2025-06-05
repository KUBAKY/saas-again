const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database-sqlite');
const { authenticateToken, requireManagerOrAbove } = require('../middleware/auth-sqlite');

const router = express.Router();

// 获取销售员列表（下拉选择用）
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    let whereClause = 'WHERE deleted_at IS NULL';
    let params = [];
    
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    } else {
      whereClause += ' AND role IN (?, ?)';
      params.push('leader', 'sales');
    }
    
    const users = await query(`
      SELECT id, name, role, team_id
      FROM users 
      ${whereClause}
      ORDER BY name
    `, params);
    
    res.json({
      code: 200,
      message: '获取成功',
      data: users,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取销售员列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取销售员列表失败',
      timestamp: Date.now()
    });
  }
});

// 获取用户列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search = '', role = '', teamId = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const currentUser = req.user;
    
    let whereClause = 'WHERE u.deleted_at IS NULL';
    let params = [];
    
    // 根据用户角色添加权限过滤
    if (currentUser.role === 'leader') {
      // 组长只能查看本组成员
      whereClause += ' AND u.team_id = ?';
      params.push(currentUser.teamId);
    } else if (currentUser.role === 'sales') {
      // 销售员只能查看自己
      whereClause += ' AND u.id = ?';
      params.push(currentUser.id);
    }
    // admin 和 manager 可以查看所有用户，不添加额外限制
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (role) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    }
    
    if (teamId) {
      whereClause += ' AND u.team_id = ?';
      params.push(teamId);
    }
    
    // 获取用户列表
    const users = await query(`
      SELECT 
        u.*,
        t.name as teamName
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(pageSize), offset]);
    
    // 获取总数
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `, params);
    
    const total = countResult[0].total;
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: users,
        pagination: {
          total,
          current: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败',
      timestamp: Date.now()
    });
  }
});

// 获取用户详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    console.log('用户详情请求 - 当前用户:', currentUser);
    console.log('请求的用户ID:', id);
    
    const user = await query(`
      SELECT 
        u.*,
        t.name as teamName
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [id]);
    
    if (user.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: Date.now()
      });
    }

    const targetUser = user[0];
    console.log('目标用户信息:', targetUser);
    
    // 权限检查：组长只能查看本组成员，销售员只能查看自己
    if (currentUser.role === 'leader') {
      // 确保数据类型一致性，都转换为数字进行比较
      const targetTeamId = parseInt(targetUser.team_id);
      const currentTeamId = parseInt(currentUser.teamId);
      
      console.log('权限检查 - 目标用户团队ID:', targetTeamId, '当前用户团队ID:', currentTeamId);
      
      if (targetTeamId !== currentTeamId) {
        return res.status(403).json({
          code: 403,
          message: '只能查看本组成员信息',
          timestamp: Date.now()
        });
      }
    } else if (currentUser.role === 'sales') {
      // 确保数据类型一致性，都转换为数字进行比较
      const targetUserId = parseInt(targetUser.id);
      const currentUserId = parseInt(currentUser.id);
      
      if (targetUserId !== currentUserId) {
        return res.status(403).json({
          code: 403,
          message: '只能查看自己的信息',
          timestamp: Date.now()
        });
      }
    }
    // admin 和 manager 可以查看所有用户，不添加额外限制
    
    // 移除密码字段
    delete targetUser.password;
    
    res.json({
      code: 200,
      message: '获取成功',
      data: targetUser,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户详情失败',
      timestamp: Date.now()
    });
  }
});

// 创建用户
router.post('/', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { phone, password, name, role, teamId, joinDate } = req.body;
    
    // 验证必填字段（密码不再是必填项）
    if (!phone || !name || !role || !joinDate) {
      return res.status(400).json({
        code: 400,
        message: '手机号、姓名、角色和入职时间为必填项',
        timestamp: Date.now()
      });
    }
    
    // 检查手机号是否已存在
    const existingUser = await query(
      'SELECT id FROM users WHERE phone = ? AND deleted_at IS NULL',
      [phone]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '手机号已存在',
        timestamp: Date.now()
      });
    }
    
    // 如果指定了团队，检查团队人数限制和组长身份限制
    if (teamId) {
      const teamInfo = await query(
        'SELECT name, member_count, max_members, leader_id FROM teams WHERE id = ? AND deleted_at IS NULL',
        [teamId]
      );
      
      if (teamInfo.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '指定的团队不存在',
          timestamp: Date.now()
        });
      }
      
      const team = teamInfo[0];
      
      // 如果是销售员，检查销售员数量限制
      if (role === 'sales') {
        // 计算当前团队中销售员的数量
        const salesCount = await query(
          'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND role = "sales" AND deleted_at IS NULL',
          [teamId]
        );
        
        if (salesCount[0].count >= team.max_members) {
          return res.status(400).json({
            code: 400,
            message: `团队"${team.name}"销售员已满，最多可容纳${team.max_members}名销售员`,
            timestamp: Date.now()
          });
        }
      }
      
      // 检查组长身份限制
      if (role === 'leader') {
        // 检查团队是否已经有组长
        const existingLeaders = await query(
          'SELECT id, name FROM users WHERE team_id = ? AND role = "leader" AND deleted_at IS NULL',
          [teamId]
        );
        
        if (existingLeaders.length > 0) {
          return res.status(400).json({
            code: 400,
            message: `团队"${team.name}"已经有组长"${existingLeaders[0].name}"，一个团队只能有一个组长`,
            timestamp: Date.now()
          });
        }
      }
    }
    
    // 如果没有提供密码，自动设置为手机号后6位
    const finalPassword = password || phone.slice(-6);
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(finalPassword, 12);
    
    // 创建用户
    const result = await query(`
      INSERT INTO users (phone, password, name, role, team_id, join_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [phone, hashedPassword, name, role, teamId || null, joinDate]);
    
    const userId = result.insertId;
    
    // 如果用户加入了团队，更新团队成员数量
    if (teamId) {
      // 重新计算团队成员数量
      const totalMemberCount = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
        [teamId]
      );
      
      await query(
        'UPDATE teams SET member_count = ? WHERE id = ?',
        [totalMemberCount[0].count, teamId]
      );
    }
    
    res.json({
      code: 200,
      message: '创建成功',
      data: { id: userId },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建用户失败',
      timestamp: Date.now()
    });
  }
});

// 更新用户
router.put('/:id', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, name, role, teamId, joinDate, status } = req.body;
    
    // 检查用户是否存在
    const existingUser = await query(
      'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: Date.now()
      });
    }
    
    const oldTeamId = existingUser[0].team_id;
    const oldRole = existingUser[0].role;
    
    // 如果要更换团队，检查新团队的人数限制和组长身份限制
    if (teamId && teamId != oldTeamId) {
      const teamInfo = await query(
        'SELECT name, member_count, max_members, leader_id FROM teams WHERE id = ? AND deleted_at IS NULL',
        [teamId]
      );
      
      if (teamInfo.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '指定的团队不存在',
          timestamp: Date.now()
        });
      }
      
      const team = teamInfo[0];
      
      // 如果是销售员，检查销售员数量限制
      if (role === 'sales') {
        // 计算当前团队中销售员的数量
        const salesCount = await query(
          'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND role = "sales" AND deleted_at IS NULL',
          [teamId]
        );
        
        if (salesCount[0].count >= team.max_members) {
          return res.status(400).json({
            code: 400,
            message: `团队"${team.name}"销售员已满，最多可容纳${team.max_members}名销售员`,
            timestamp: Date.now()
          });
        }
      }
      
      // 检查组长身份限制
      if (role === 'leader') {
        // 检查目标团队是否已经有组长
        const existingLeaders = await query(
          'SELECT id, name FROM users WHERE team_id = ? AND role = "leader" AND deleted_at IS NULL',
          [teamId]
        );
        
        if (existingLeaders.length > 0) {
          return res.status(400).json({
            code: 400,
            message: `团队"${team.name}"已经有组长"${existingLeaders[0].name}"，一个团队只能有一个组长`,
            timestamp: Date.now()
          });
        }
      }
    }
    
    // 如果在同一团队内更改角色为组长，检查组长身份限制
    if (role === 'leader' && oldRole !== 'leader' && teamId === oldTeamId && teamId) {
      const existingLeaders = await query(
        'SELECT id, name FROM users WHERE team_id = ? AND role = "leader" AND id != ? AND deleted_at IS NULL',
        [teamId, id]
      );
      
      if (existingLeaders.length > 0) {
        const teamInfo = await query(
          'SELECT name FROM teams WHERE id = ? AND deleted_at IS NULL',
          [teamId]
        );
        const teamName = teamInfo[0]?.name || '未知团队';
        
        return res.status(400).json({
          code: 400,
          message: `团队"${teamName}"已经有组长"${existingLeaders[0].name}"，一个团队只能有一个组长`,
          timestamp: Date.now()
        });
      }
    }
    
    // 更新用户信息
    await query(`
      UPDATE users 
      SET phone = ?, name = ?, role = ?, team_id = ?, join_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [phone, name, role, teamId || null, joinDate, status || 'active', id]);
    
    // 重新计算团队成员数量
    if (oldTeamId !== teamId) {
      // 重新计算旧团队的成员数量
      if (oldTeamId) {
        const oldTeamMemberCount = await query(
          'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
          [oldTeamId]
        );
        
        await query(
          'UPDATE teams SET member_count = ? WHERE id = ?',
          [oldTeamMemberCount[0].count - 1, oldTeamId]
        );
      }
      
      // 重新计算新团队的成员数量
      if (teamId) {
        const newTeamMemberCount = await query(
          'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
          [teamId]
        );
        
        await query(
          'UPDATE teams SET member_count = ? WHERE id = ?',
          [newTeamMemberCount[0].count + 1, teamId]
        );
      }
    }
    
    res.json({
      code: 200,
      message: '更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户失败',
      timestamp: Date.now()
    });
  }
});

// 重置用户密码
router.put('/:id/password', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        code: 400,
        message: '新密码不能为空',
        timestamp: Date.now()
      });
    }
    
    // 检查用户是否存在
    const existingUser = await query(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: Date.now()
      });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // 更新密码
    await query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    
    res.json({
      code: 200,
      message: '密码重置成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '重置密码失败',
      timestamp: Date.now()
    });
  }
});

// 删除用户
router.delete('/:id', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const existingUser = await query(
      'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        timestamp: Date.now()
      });
    }
    
    const user = existingUser[0];
    
    // 检查是否有关联的客户
    const customers = await query(
      'SELECT COUNT(*) as count FROM customers WHERE owner_id = ? AND deleted_at IS NULL',
      [id]
    );
    
    if (customers[0].count > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户还有关联的客户，无法删除',
        timestamp: Date.now()
      });
    }
    
    // 软删除用户
    await query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    // 更新团队成员数量
    if (user.team_id) {
      await query(
        'UPDATE teams SET member_count = member_count - 1 WHERE id = ?',
        [user.team_id]
      );
    }
    
    res.json({
      code: 200,
      message: '删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除用户失败',
      timestamp: Date.now()
    });
  }
});

// 批量删除用户
router.delete('/batch/:ids', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { ids } = req.params;
    const userIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (userIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供有效的用户ID列表',
        timestamp: Date.now()
      });
    }
    
    // 检查所有用户是否存在
    const placeholders = userIds.map(() => '?').join(',');
    const existingUsers = await query(
      `SELECT id, name, team_id FROM users WHERE id IN (${placeholders}) AND deleted_at IS NULL`,
      userIds
    );
    
    if (existingUsers.length !== userIds.length) {
      const existingIds = existingUsers.map(user => user.id);
      const notFoundIds = userIds.filter(id => !existingIds.includes(id));
      return res.status(404).json({
        code: 404,
        message: `用户不存在: ${notFoundIds.join(', ')}`,
        timestamp: Date.now()
      });
    }
    
    // 批量软删除用户
    await query(
      `UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
      userIds
    );
    
    // 重新计算相关团队的成员数量
    const affectedTeams = [...new Set(existingUsers.map(user => user.team_id).filter(Boolean))];
    
    for (const teamId of affectedTeams) {
      const memberCount = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
        [teamId]
      );
      
      await query(
        'UPDATE teams SET member_count = ? WHERE id = ?',
        [memberCount[0].count - existingUsers.filter(user => user.team_id === teamId).length, teamId]
      );
    }
    
    res.json({
      code: 200,
      message: `成功删除 ${userIds.length} 个用户`,
      data: {
        deletedCount: userIds.length,
        deletedIds: userIds
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量删除用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除用户失败',
      timestamp: Date.now()
    });
  }
});

// 批量更新用户团队
router.post('/batch-update-team', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { userIds, teamId } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要更新的用户',
        timestamp: Date.now()
      });
    }
    
    // 如果指定了团队，先检查团队信息和人数限制
    let targetTeam = null;
    if (teamId) {
      const teamInfo = await query(
        'SELECT name, member_count, max_members, leader_id FROM teams WHERE id = ? AND deleted_at IS NULL',
        [teamId]
      );
      
      if (teamInfo.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '指定的团队不存在',
          timestamp: Date.now()
        });
      }
      
      targetTeam = teamInfo[0];
      
      // 计算需要加入目标团队的销售员数量（排除已经在该团队的用户）
      const salesUsersNotInTargetTeam = await query(
        `SELECT COUNT(*) as count FROM users 
         WHERE id IN (${userIds.map(() => '?').join(',')}) 
         AND role = 'sales'
         AND (team_id != ? OR team_id IS NULL) 
         AND deleted_at IS NULL`,
        [...userIds, teamId]
      );
      
      const newSalesCount = salesUsersNotInTargetTeam[0].count;
      
      // 计算目标团队当前的销售员数量
      const currentSalesCount = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND role = "sales" AND deleted_at IS NULL',
        [teamId]
      );
      
      if (currentSalesCount[0].count + newSalesCount > targetTeam.max_members) {
        return res.status(400).json({
          code: 400,
          message: `团队"${targetTeam.name}"当前有${currentSalesCount[0].count}名销售员，最多可容纳${targetTeam.max_members}名销售员，无法添加${newSalesCount}名新销售员`,
          timestamp: Date.now()
        });
      }
      
      // 检查组长身份限制
      const leadersToAdd = await query(
        `SELECT id, name FROM users 
         WHERE id IN (${userIds.map(() => '?').join(',')}) 
         AND role = 'leader' 
         AND (team_id != ? OR team_id IS NULL)
         AND deleted_at IS NULL`,
        [...userIds, teamId]
      );
      
      if (leadersToAdd.length > 0) {
        // 检查目标团队是否已经有组长
        const existingLeaders = await query(
          'SELECT id, name FROM users WHERE team_id = ? AND role = "leader" AND deleted_at IS NULL',
          [teamId]
        );
        
        if (existingLeaders.length > 0) {
          const leaderNames = leadersToAdd.map(leader => leader.name);
          return res.status(400).json({
            code: 400,
            message: `团队"${targetTeam.name}"已经有组长"${existingLeaders[0].name}"，无法添加组长身份的用户: ${leaderNames.join(', ')}。一个团队只能有一个组长`,
            timestamp: Date.now()
          });
        }
        
        if (leadersToAdd.length > 1) {
          const leaderNames = leadersToAdd.map(leader => leader.name);
          return res.status(400).json({
            code: 400,
            message: `无法同时添加多个组长到团队"${targetTeam.name}": ${leaderNames.join(', ')}。一个团队只能有一个组长`,
            timestamp: Date.now()
          });
        }
      }
    }
    
    let successCount = 0;
    let failedUsers = [];
    
    for (const userId of userIds) {
      try {
        // 检查用户是否存在
        const existingUser = await query(
          'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
          [userId]
        );
        
        if (existingUser.length === 0) {
          failedUsers.push({ id: userId, reason: '用户不存在' });
          continue;
        }
        
        const user = existingUser[0];
        const oldTeamId = user.team_id;
        
        // 如果用户已经在目标团队中，跳过
        if (oldTeamId === teamId) {
          successCount++;
          continue;
        }
        
        // 如果是组长身份且要加入新团队，再次检查目标团队的组长限制
        if (user.role === 'leader' && teamId && oldTeamId !== teamId) {
          const existingLeaders = await query(
            'SELECT id, name FROM users WHERE team_id = ? AND role = "leader" AND deleted_at IS NULL',
            [teamId]
          );
          
          if (existingLeaders.length > 0) {
            failedUsers.push({ 
              id: userId, 
              reason: `目标团队已有组长"${existingLeaders[0].name}"，一个团队只能有一个组长` 
            });
            continue;
          }
        }
        
        // 更新用户团队
        await query(
          'UPDATE users SET team_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [teamId || null, userId]
        );
        
        // 重新计算团队成员数量
        if (oldTeamId !== teamId) {
          // 重新计算旧团队的成员数量
          if (oldTeamId) {
            const oldTeamMemberCount = await query(
              'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
              [oldTeamId]
            );
            
            await query(
              'UPDATE teams SET member_count = ? WHERE id = ?',
              [oldTeamMemberCount[0].count - 1, oldTeamId]
            );
          }
          
          // 重新计算新团队的成员数量
          if (teamId) {
            const newTeamMemberCount = await query(
              'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
              [teamId]
            );
            
            await query(
              'UPDATE teams SET member_count = ? WHERE id = ?',
              [newTeamMemberCount[0].count + 1, teamId]
            );
          }
        }
        
        successCount++;
      } catch (error) {
        console.error(`更新用户 ${userId} 团队失败:`, error);
        failedUsers.push({ id: userId, reason: '更新失败' });
      }
    }
    
    res.json({
      code: 200,
      message: `批量更新团队完成，成功 ${successCount} 个，失败 ${failedUsers.length} 个`,
      data: {
        successCount,
        failedCount: failedUsers.length,
        failedUsers
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量更新用户团队失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量更新用户团队失败',
      timestamp: Date.now()
    });
  }
});

// 批量更新用户状态
router.post('/batch-update-status', authenticateToken, requireManagerOrAbove, async (req, res) => {
  try {
    const { userIds, status } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要更新的用户',
        timestamp: Date.now()
      });
    }
    
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '状态值无效',
        timestamp: Date.now()
      });
    }
    
    let successCount = 0;
    let failedUsers = [];
    
    for (const userId of userIds) {
      try {
        // 检查用户是否存在
        const existingUser = await query(
          'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
          [userId]
        );
        
        if (existingUser.length === 0) {
          failedUsers.push({ id: userId, reason: '用户不存在' });
          continue;
        }
        
        // 更新用户状态
        await query(
          'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, userId]
        );
        
        successCount++;
      } catch (error) {
        console.error(`更新用户 ${userId} 状态失败:`, error);
        failedUsers.push({ id: userId, reason: '更新失败' });
      }
    }
    
    res.json({
      code: 200,
      message: `批量更新状态完成，成功 ${successCount} 个，失败 ${failedUsers.length} 个`,
      data: {
        successCount,
        failedCount: failedUsers.length,
        failedUsers
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('批量更新用户状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量更新用户状态失败',
      timestamp: Date.now()
    });
  }
});

module.exports = router; 
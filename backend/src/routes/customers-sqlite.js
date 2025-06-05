const express = require('express');
const { query } = require('../config/database-sqlite');
const { authenticateToken, requireRole } = require('../middleware/auth-sqlite');

const router = express.Router();

// 获取客户列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      search = '', 
      starLevel = '', 
      ownerId = '', 
      teamId = '',
      sortField = '',
      sortOrder = ''
    } = req.query;
    
    // 调试日志
    console.log('📋 客户列表查询参数:', {
      page, pageSize, search, starLevel, ownerId, teamId, sortField, sortOrder
    });
    
    const offset = (page - 1) * pageSize;
    const { user } = req;
    
    let whereClause = 'WHERE c.deleted_at IS NULL';
    let params = [];
    
    // 权限控制
    if (user.role === 'sales') {
      whereClause += ' AND c.owner_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND c.team_id = ?';
      params.push(user.teamId);
    }
    
    if (search) {
      whereClause += ' AND (c.name LIKE ? OR c.phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (starLevel) {
      whereClause += ' AND c.star_level = ?';
      params.push(starLevel);
    }
    
    if (ownerId) {
      whereClause += ' AND c.owner_id = ?';
      params.push(ownerId);
    }
    
    if (teamId) {
      whereClause += ' AND c.team_id = ?';
      params.push(teamId);
    }
    
    // 构建排序子句
    let orderClause = 'ORDER BY ';
    if (sortField && sortOrder) {
      const validSortFields = {
        'starLevel': 'c.star_level',
        'lastFollowTime': 'c.last_follow_time',
        'createdAt': 'c.created_at',
        'updatedAt': 'c.updated_at',
        'name': 'c.name'
      };
      
      const dbField = validSortFields[sortField];
      console.log('🔍 排序字段映射:', { sortField, dbField, sortOrder });
      
      if (dbField && (sortOrder === 'ascend' || sortOrder === 'descend')) {
        const direction = sortOrder === 'ascend' ? 'ASC' : 'DESC';
        orderClause += `${dbField} ${direction}`;
        
        // 添加次要排序，确保排序稳定
        if (sortField !== 'createdAt') {
          orderClause += ', c.created_at DESC';
        }
        console.log('✅ 使用自定义排序:', orderClause);
      } else {
        orderClause += 'c.created_at DESC';
        console.log('⚠️ 使用默认排序 (无效的排序参数):', orderClause);
      }
    } else {
      orderClause += 'c.created_at DESC';
      console.log('📅 使用默认排序 (无排序参数):', orderClause);
    }
    
    // 获取客户列表
    const customers = await query(`
      SELECT 
        c.*,
        u.name as owner_name,
        u.phone as owner_phone,
        u.role as owner_role,
        t.name as team_name,
        (
          SELECT COUNT(*) 
          FROM follow_records fr 
          WHERE fr.customer_id = c.id 
          AND DATE(fr.follow_time) = DATE('now', 'localtime')
        ) as today_follow_count
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      LEFT JOIN teams t ON c.team_id = t.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(pageSize), offset]);
    
    // 获取总数
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM customers c
      ${whereClause}
    `, params);
    
    const total = countResult[0].total;
    
    // 转换为前端期望的驼峰格式
    const formattedCustomers = customers.map(customerData => ({
      id: customerData.id,
      starLevel: customerData.star_level,
      name: customerData.name,
      phone: customerData.phone,
      gender: customerData.gender,
      age: customerData.age,
      qualification: customerData.qualification,
      requirements: customerData.requirements,
      ownerId: customerData.owner_id,
      teamId: customerData.team_id,
      lastFollowTime: customerData.last_follow_time,
      followCount: customerData.follow_count,
      todayFollowCount: customerData.today_follow_count,
      createdAt: customerData.created_at,
      updatedAt: customerData.updated_at,
      owner: customerData.owner_name ? {
        id: customerData.owner_id,
        name: customerData.owner_name,
        phone: customerData.owner_phone,
        role: customerData.owner_role
      } : null,
      team: customerData.team_name ? {
        id: customerData.team_id,
        name: customerData.team_name
      } : null
    }));
    
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: formattedCustomers,
        pagination: {
          total,
          current: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取客户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取客户列表失败',
      timestamp: Date.now()
    });
  }
});

// 创建客户
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { starLevel, name, phone, gender, age, qualification, requirements, ownerId, teamId } = req.body;
    const { user } = req;
    
    // 权限检查：只有管理员和经理可以创建客户
    if (user.role === 'sales' || user.role === 'leader') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，无法创建客户',
        timestamp: Date.now()
      });
    }
    
    // 验证必填字段
    if (!starLevel || !name || !phone) {
      return res.status(400).json({
        code: 400,
        message: '星级、姓名和电话为必填项',
        timestamp: Date.now()
      });
    }
    
    // 检查电话号码是否已存在
    const existingCustomer = await query(`
      SELECT id, name FROM customers 
      WHERE phone = ? AND deleted_at IS NULL
    `, [phone]);
    
    if (existingCustomer.length > 0) {
      return res.status(400).json({
        code: 400,
        message: `电话号码 ${phone} 已被客户 "${existingCustomer[0].name}" 使用，请检查是否重复录入`,
        timestamp: Date.now()
      });
    }
    
    // 处理归属逻辑
    let finalOwnerId = ownerId;
    let finalTeamId = teamId;
    
    console.log('🔍 归属逻辑处理开始:', { ownerId, teamId, finalOwnerId, finalTeamId });
    
    if (!teamId) {
      console.log('📝 场景1: 没有选择小组，查找总经理...');
      // 没有选择小组，归属到总经理
      // 如果当前用户是总经理，就归属给当前用户，否则归属给第一个总经理
      if (user.role === 'manager') {
        finalOwnerId = user.id;
        finalTeamId = null;
        console.log('✅ 场景1处理完成(当前用户是总经理):', { finalOwnerId, finalTeamId });
      } else {
        const managerInfo = await query(`
          SELECT id FROM users WHERE role = 'manager' AND deleted_at IS NULL ORDER BY id ASC LIMIT 1
        `);
        
        console.log('🔍 总经理查询结果:', managerInfo);
        
        if (managerInfo.length === 0) {
          return res.status(500).json({
            code: 500,
            message: '系统中没有找到总经理用户',
            timestamp: Date.now()
          });
        }
        
        finalOwnerId = managerInfo[0].id;
        finalTeamId = null;
        console.log('✅ 场景1处理完成(查找到的总经理):', { finalOwnerId, finalTeamId });
      }
    } else if (!ownerId) {
      console.log('📝 场景2: 只选择了小组，查找组长...', { teamId });
      // 只选择了小组，没有选择销售员，归属到组长
      const teamInfo = await query(`
        SELECT leader_id FROM teams WHERE id = ? AND deleted_at IS NULL
      `, [teamId]);
      
      console.log('🔍 小组查询结果:', teamInfo);
      
      if (teamInfo.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '选择的小组不存在',
          timestamp: Date.now()
        });
      }
      
      if (!teamInfo[0].leader_id) {
        return res.status(400).json({
          code: 400,
          message: '选择的小组没有设置组长',
          timestamp: Date.now()
        });
      }
      
      finalOwnerId = teamInfo[0].leader_id;
      finalTeamId = teamId;
      console.log('✅ 场景2处理完成:', { finalOwnerId, finalTeamId });
    } else {
      console.log('📝 场景3: 既选择了小组又选择了销售员...', { teamId, ownerId });
      // 既选择了小组又选择了销售员，验证销售员是否属于该小组
      const salesInfo = await query(`
        SELECT id, team_id FROM users WHERE id = ? AND role = 'sales' AND deleted_at IS NULL
      `, [ownerId]);
      
      console.log('🔍 销售员查询结果:', salesInfo);
      
      if (salesInfo.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '选择的销售员不存在',
          timestamp: Date.now()
        });
      }
      
      if (salesInfo[0].team_id !== teamId) {
        return res.status(400).json({
          code: 400,
          message: '销售员不属于选择的小组',
          timestamp: Date.now()
        });
      }
      
      finalOwnerId = ownerId;
      finalTeamId = teamId;
      console.log('✅ 场景3处理完成:', { finalOwnerId, finalTeamId });
    }
    
    console.log('🎯 最终归属结果:', { finalOwnerId, finalTeamId });
    
    // 创建客户
    const result = await query(`
      INSERT INTO customers (star_level, name, phone, gender, age, qualification, requirements, owner_id, team_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [starLevel, name, phone, gender || null, age || null, qualification || null, requirements || null, finalOwnerId, finalTeamId]);
    
    const customerId = result.insertId;
    console.log('🔍 客户创建结果:', { result, customerId, insertId: result.insertId });
    
    res.json({
      code: 200,
      message: '创建成功',
      data: { id: customerId },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('创建客户失败:', error);
    
    // 处理唯一约束违反错误
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        code: 400,
        message: '该电话号码已存在，请检查是否重复录入',
        timestamp: Date.now()
      });
    }
    
    res.status(500).json({
      code: 500,
      message: '创建客户失败',
      timestamp: Date.now()
    });
  }
});

// 获取客户详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    let whereClause = 'WHERE c.id = ? AND c.deleted_at IS NULL';
    let params = [id];
    
    // 权限控制
    if (user.role === 'sales') {
      whereClause += ' AND c.owner_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND c.team_id = ?';
      params.push(user.teamId);
    }
    
    const customer = await query(`
      SELECT 
        c.*,
        u.name as owner_name,
        u.phone as owner_phone,
        u.role as owner_role,
        t.name as team_name
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      LEFT JOIN teams t ON c.team_id = t.id
      ${whereClause}
    `, params);
    
    if (customer.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在或无权限访问',
        timestamp: Date.now()
      });
    }
    
    const customerData = customer[0];
    
    // 转换为前端期望的驼峰格式
    const formattedCustomer = {
      id: customerData.id,
      starLevel: customerData.star_level,
      name: customerData.name,
      phone: customerData.phone,
      gender: customerData.gender,
      age: customerData.age,
      qualification: customerData.qualification,
      requirements: customerData.requirements,
      ownerId: customerData.owner_id,
      teamId: customerData.team_id,
      lastFollowTime: customerData.last_follow_time,
      followCount: customerData.follow_count,
      todayFollowCount: customerData.today_follow_count,
      createdAt: customerData.created_at,
      updatedAt: customerData.updated_at,
      owner: customerData.owner_name ? {
        id: customerData.owner_id,
        name: customerData.owner_name,
        phone: customerData.owner_phone,
        role: customerData.owner_role
      } : null,
      team: customerData.team_name ? {
        id: customerData.team_id,
        name: customerData.team_name
      } : null
    };
    
    res.json({
      code: 200,
      message: '获取成功',
      data: formattedCustomer,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取客户详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取客户详情失败',
      timestamp: Date.now()
    });
  }
});

// 更新客户
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { starLevel, name, phone, gender, age, qualification, requirements, ownerId, teamId } = req.body;
    const { user } = req;
    
    // 权限检查：只有管理员和总经理可以编辑客户
    if (user.role === 'sales' || user.role === 'leader') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，无法编辑客户信息',
        timestamp: Date.now()
      });
    }
    
    // 检查客户是否存在
    const existingCustomer = await query(`
      SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL
    `, [id]);
    
    if (existingCustomer.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在',
        timestamp: Date.now()
      });
    }
    
    // 如果电话号码发生变化，检查新电话号码是否已存在
    if (phone && phone !== existingCustomer[0].phone) {
      const phoneCheck = await query(`
        SELECT id, name FROM customers 
        WHERE phone = ? AND deleted_at IS NULL AND id != ?
      `, [phone, id]);
      
      if (phoneCheck.length > 0) {
        return res.status(400).json({
          code: 400,
          message: `电话号码 ${phone} 已被客户 "${phoneCheck[0].name}" 使用，请检查是否重复录入`,
          timestamp: Date.now()
        });
      }
    }
    
    // 更新客户信息
    await query(`
      UPDATE customers 
      SET star_level = ?, name = ?, phone = ?, gender = ?, age = ?, qualification = ?, requirements = ?, 
          owner_id = ?, team_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [starLevel, name, phone, gender || null, age || null, qualification || null, requirements || null,
        ownerId || existingCustomer[0].owner_id, teamId || existingCustomer[0].team_id, id]);
    
    res.json({
      code: 200,
      message: '更新成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新客户失败:', error);
    
    // 处理唯一约束违反错误
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({
        code: 400,
        message: '该电话号码已存在，请检查是否重复录入',
        timestamp: Date.now()
      });
    }
    
    res.status(500).json({
      code: 500,
      message: '更新客户失败',
      timestamp: Date.now()
    });
  }
});

// 删除客户
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // 权限检查
    let whereClause = 'WHERE id = ? AND deleted_at IS NULL';
    let params = [id];
    
    if (user.role === 'sales') {
      whereClause += ' AND owner_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND team_id = ?';
      params.push(user.teamId);
    }
    
    const existingCustomer = await query(`
      SELECT * FROM customers ${whereClause}
    `, params);
    
    if (existingCustomer.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在或无权限删除',
        timestamp: Date.now()
      });
    }
    
    // 软删除客户
    await query(
      'UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({
      code: 200,
      message: '删除成功',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除客户失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除客户失败',
      timestamp: Date.now()
    });
  }
});

// 获取客户的跟进记录
router.get('/:id/follow-records', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const { user } = req;
    
    // 权限检查
    let whereClause = 'WHERE fr.customer_id = ?';
    let params = [id];
    
    if (user.role === 'sales') {
      whereClause += ' AND c.owner_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND c.team_id = ?';
      params.push(user.teamId);
    }
    
    // 获取跟进记录列表
    const records = await query(`
      SELECT 
        fr.*,
        u.name as user_name
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
    console.error('获取客户跟进记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取客户跟进记录失败',
      timestamp: Date.now()
    });
  }
});

// 为客户添加跟进记录
router.post('/:id/follow-records', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, followTime } = req.body;
    const { user } = req;
    
    // 验证必填字段
    if (!content || !followTime) {
      return res.status(400).json({
        code: 400,
        message: '跟进内容和跟进时间为必填项',
        timestamp: Date.now()
      });
    }
    
    // 验证跟进时间是否在过去72小时内
    const followDate = new Date(followTime);
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    
    console.log('🔍 时间验证调试信息:');
    console.log(`跟进时间: ${followTime} -> ${followDate.toISOString()}`);
    console.log(`当前时间: ${now.toISOString()}`);
    console.log(`72小时前: ${seventyTwoHoursAgo.toISOString()}`);
    console.log(`跟进时间 > 当前时间: ${followDate > now}`);
    console.log(`跟进时间 < 72小时前: ${followDate < seventyTwoHoursAgo}`);
    
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
    
    // 权限检查：确保客户存在且有权限访问
    let whereClause = 'WHERE id = ? AND deleted_at IS NULL';
    let params = [id];
    
    if (user.role === 'sales') {
      whereClause += ' AND owner_id = ?';
      params.push(user.id);
    } else if (user.role === 'leader') {
      whereClause += ' AND team_id = ?';
      params.push(user.teamId);
    }
    
    const customer = await query(`
      SELECT * FROM customers ${whereClause}
    `, params);
    
    if (customer.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '客户不存在或无权限访问',
        timestamp: Date.now()
      });
    }
    
    // 创建跟进记录
    const result = await query(`
      INSERT INTO follow_records (customer_id, sales_id, content, follow_time, created_at)
      VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
    `, [id, user.id, content, followTime]);
    
    // 更新客户的最后跟进时间和跟进次数
    await query(`
      UPDATE customers 
      SET last_follow_time = ?, follow_count = follow_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [followTime, id]);
    
    res.json({
      code: 200,
      message: '创建跟进记录成功',
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
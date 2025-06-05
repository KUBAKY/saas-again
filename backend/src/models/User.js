const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // 根据手机号查找用户
  static async findByPhone(phone) {
    const users = await query(
      'SELECT * FROM users WHERE phone = ? AND deleted_at IS NULL',
      [phone]
    );
    return users[0] || null;
  }

  // 根据ID查找用户
  static async findById(id) {
    const users = await query(
      `SELECT u.*, t.name as team_name, t.level as team_level 
       FROM users u 
       LEFT JOIN teams t ON u.team_id = t.id AND t.deleted_at IS NULL
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    return users[0] || null;
  }

  // 获取用户列表
  static async findAll(options = {}) {
    const {
      page = 1,
      pageSize = 20,
      search = '',
      role = '',
      teamId = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    let whereConditions = ['u.deleted_at IS NULL'];
    let params = [];

    // 搜索条件
    if (search) {
      whereConditions.push('(u.name LIKE ? OR u.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // 角色筛选
    if (role) {
      whereConditions.push('u.role = ?');
      params.push(role);
    }

    // 团队筛选
    if (teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    const whereClause = whereConditions.join(' AND ');
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM users u 
      WHERE ${whereClause}
    `;
    const [{ total }] = await query(countSql, params);

    // 获取列表数据
    const offset = (page - 1) * pageSize;
    const listSql = `
      SELECT 
        u.id, u.phone, u.name, u.role, u.team_id, u.join_date, u.status, u.created_at,
        t.name as team_name, t.level as team_level
      FROM users u 
      LEFT JOIN teams t ON u.team_id = t.id AND t.deleted_at IS NULL
      WHERE ${whereClause}
      ORDER BY u.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    
    const list = await query(listSql, [...params, pageSize, offset]);

    return {
      list,
      pagination: {
        current: page,
        pageSize,
        total
      }
    };
  }

  // 创建用户
  static async create(userData) {
    const {
      phone,
      password,
      name,
      role,
      teamId,
      joinDate
    } = userData;

    // 检查手机号是否已存在
    const existingUser = await this.findByPhone(phone);
    if (existingUser) {
      throw new Error('手机号已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    return await transaction(async (connection) => {
      // 插入用户
      const [result] = await connection.execute(
        `INSERT INTO users (phone, password, name, role, team_id, join_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [phone, hashedPassword, name, role, teamId, joinDate]
      );

      const userId = result.insertId;

      // 如果用户加入了团队，更新团队成员数量
      if (teamId) {
        await connection.execute(
          'UPDATE teams SET member_count = member_count + 1 WHERE id = ?',
          [teamId]
        );
      }

      // 记录操作日志
      await connection.execute(
        `INSERT INTO operation_logs (user_id, action, target_type, target_id, details) 
         VALUES (?, 'CREATE_USER', 'user', ?, ?)`,
        [userId, userId, JSON.stringify({ name, role, teamId })]
      );

      return await this.findById(userId);
    });
  }

  // 更新用户信息
  static async update(id, userData, operatorId) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    const {
      name,
      role,
      teamId,
      joinDate,
      status
    } = userData;

    return await transaction(async (connection) => {
      const updateFields = [];
      const params = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        params.push(name);
      }
      if (role !== undefined) {
        updateFields.push('role = ?');
        params.push(role);
      }
      if (teamId !== undefined) {
        updateFields.push('team_id = ?');
        params.push(teamId);
      }
      if (joinDate !== undefined) {
        updateFields.push('join_date = ?');
        params.push(joinDate);
      }
      if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
      }

      if (updateFields.length === 0) {
        return user;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      // 更新用户信息
      await connection.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      // 处理团队变更
      if (teamId !== undefined && teamId !== user.team_id) {
        // 从原团队移除
        if (user.team_id) {
          await connection.execute(
            'UPDATE teams SET member_count = member_count - 1 WHERE id = ?',
            [user.team_id]
          );
        }
        // 加入新团队
        if (teamId) {
          await connection.execute(
            'UPDATE teams SET member_count = member_count + 1 WHERE id = ?',
            [teamId]
          );
        }
      }

      // 记录操作日志
      await connection.execute(
        `INSERT INTO operation_logs (user_id, action, target_type, target_id, details) 
         VALUES (?, 'UPDATE_USER', 'user', ?, ?)`,
        [operatorId, id, JSON.stringify(userData)]
      );

      return await this.findById(id);
    });
  }

  // 删除用户（软删除）
  static async delete(id, operatorId) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    return await transaction(async (connection) => {
      // 软删除用户
      await connection.execute(
        'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      // 更新团队成员数量
      if (user.team_id) {
        await connection.execute(
          'UPDATE teams SET member_count = member_count - 1 WHERE id = ?',
          [user.team_id]
        );
      }

      // 将用户的客户转移给团队组长或管理员
      // 这里需要根据业务规则来处理客户转移逻辑

      // 记录操作日志
      await connection.execute(
        `INSERT INTO operation_logs (user_id, action, target_type, target_id, details) 
         VALUES (?, 'DELETE_USER', 'user', ?, ?)`,
        [operatorId, id, JSON.stringify({ name: user.name, role: user.role })]
      );

      return true;
    });
  }

  // 修改密码
  static async changePassword(id, oldPassword, newPassword) {
    const user = await query(
      'SELECT password FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (user.length === 0) {
      throw new Error('用户不存在');
    }

    // 验证原密码
    const isValidPassword = await bcrypt.compare(oldPassword, user[0].password);
    if (!isValidPassword) {
      throw new Error('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // 更新密码
    await query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    // 记录操作日志
    await query(
      `INSERT INTO operation_logs (user_id, action, target_type, target_id, details) 
       VALUES (?, 'CHANGE_PASSWORD', 'user', ?, ?)`,
      [id, id, JSON.stringify({ action: 'password_changed' })]
    );

    return true;
  }

  // 重置密码（管理员操作）
  static async resetPassword(id, newPassword, operatorId) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

    // 更新密码
    await query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    // 记录操作日志
    await query(
      `INSERT INTO operation_logs (user_id, action, target_type, target_id, details) 
       VALUES (?, 'RESET_PASSWORD', 'user', ?, ?)`,
      [operatorId, id, JSON.stringify({ target_user: user.name })]
    );

    return true;
  }

  // 验证密码
  static async verifyPassword(phone, password) {
    const user = await this.findByPhone(phone);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  // 获取团队成员
  static async getTeamMembers(teamId) {
    return await query(
      `SELECT id, phone, name, role, join_date, status, created_at
       FROM users 
       WHERE team_id = ? AND deleted_at IS NULL
       ORDER BY role, created_at`,
      [teamId]
    );
  }

  // 新增方法：根据ID获取用户（用于控制器）
  static async getById(id) {
    return await this.findById(id);
  }

  // 新增方法：获取用户列表（用于控制器）
  static async getList(options = {}) {
    return await this.findAll(options);
  }

  // 新增方法：检查手机号是否存在
  static async checkPhoneExists(phone, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE phone = ? AND deleted_at IS NULL';
    let params = [phone];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const [{ count }] = await query(sql, params);
    return count > 0;
  }

  // 新增方法：检查邮箱是否存在
  static async checkEmailExists(email, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ? AND deleted_at IS NULL';
    let params = [email];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const [{ count }] = await query(sql, params);
    return count > 0;
  }

  // 新增方法：更新用户（用于控制器）
  static async update(id, userData) {
    const user = await this.getById(id);
    if (!user) {
      return false;
    }

    const updateFields = [];
    const params = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        params.push(userData[key]);
      }
    });

    if (updateFields.length === 0) {
      return true;
    }

    updateFields.push('updated_at = NOW()');
    params.push(id);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // 新增方法：删除用户（用于控制器）
  static async delete(id) {
    // 检查用户是否还有客户
    const customerCheckSql = 'SELECT COUNT(*) as count FROM customers WHERE assigned_to = ? AND deleted_at IS NULL';
    const [{ count }] = await query(customerCheckSql, [id]);
    
    if (count > 0) {
      throw new Error('用户还有客户，无法删除');
    }

    const sql = 'UPDATE users SET deleted_at = NOW() WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 新增方法：更新密码（用于控制器）
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const sql = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
    const result = await query(sql, [hashedPassword, id]);
    return result.affectedRows > 0;
  }

  // 新增方法：获取用户统计数据
  static async getStatistics(options = {}) {
    const { userRole, userId, teamId, startDate, endDate } = options;

    let whereConditions = ['u.deleted_at IS NULL'];
    let params = [];

    // 根据用户角色添加权限过滤
    if (userRole === 'sales') {
      whereConditions.push('u.id = ?');
      params.push(userId);
    } else if (userRole === 'leader' && teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    // 时间范围过滤
    if (startDate) {
      whereConditions.push('u.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('u.created_at <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN u.role = 'manager' THEN 1 END) as manager_count,
        COUNT(CASE WHEN u.role = 'leader' THEN 1 END) as leader_count,
        COUNT(CASE WHEN u.role = 'sales' THEN 1 END) as sales_count,
        COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN u.status = 'inactive' THEN 1 END) as inactive_users
      FROM users u
      ${whereClause}
    `;

    const [statistics] = await query(sql, params);
    return statistics;
  }

  // 新增方法：获取销售员列表
  static async getSalesList(options = {}) {
    const { userRole, currentUserTeamId, teamId } = options;

    let whereConditions = ['u.deleted_at IS NULL', 'u.status = "active"'];
    let params = [];

    // 根据用户角色添加权限过滤
    if (userRole === 'leader' && currentUserTeamId) {
      whereConditions.push('u.team_id = ?');
      params.push(currentUserTeamId);
    } else if (teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    // 只获取销售员和组长
    whereConditions.push('u.role IN ("sales", "leader")');

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.phone,
        u.role,
        t.name as team_name
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      ${whereClause}
      ORDER BY u.role, u.name
    `;

    return await query(sql, params);
  }
}

module.exports = User; 
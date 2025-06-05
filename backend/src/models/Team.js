const { query, transaction } = require('../config/database');

class Team {
  // 获取团队列表
  static async getList(options = {}) {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      level = '',
      status = 'active'
    } = options;

    let whereConditions = ['t.deleted_at IS NULL'];
    let params = [];

    // 搜索条件
    if (search) {
      whereConditions.push('(t.name LIKE ? OR t.description LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    // 等级筛选
    if (level) {
      whereConditions.push('t.level = ?');
      params.push(level);
    }

    // 状态筛选
    if (status) {
      whereConditions.push('t.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM teams t ${whereClause}`;
    const [{ total }] = await query(countSql, params);

    // 查询列表数据
    const offset = (page - 1) * pageSize;
    const listSql = `
      SELECT 
        t.*,
        u.name as leader_name,
        u.phone as leader_phone,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL) as member_count,
        (SELECT COUNT(*) FROM customers c 
         JOIN users u2 ON c.assigned_to = u2.id 
         WHERE u2.team_id = t.id AND c.deleted_at IS NULL) as customer_count
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(pageSize, offset);
    const list = await query(listSql, params);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // 根据ID获取团队详情
  static async getById(id) {
    const sql = `
      SELECT 
        t.*,
        u.name as leader_name,
        u.phone as leader_phone,
        u.email as leader_email,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL) as member_count,
        (SELECT COUNT(*) FROM customers c 
         JOIN users u2 ON c.assigned_to = u2.id 
         WHERE u2.team_id = t.id AND c.deleted_at IS NULL) as customer_count
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.id = ? AND t.deleted_at IS NULL
    `;
    const [team] = await query(sql, [id]);
    return team;
  }

  // 创建团队
  static async create(teamData) {
    const {
      name,
      description = '',
      level = 1,
      leader_id = null,
      target_amount = 0,
      status = 'active',
      created_by
    } = teamData;

    const sql = `
      INSERT INTO teams (
        name, description, level, leader_id, target_amount, status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [name, description, level, leader_id, target_amount, status, created_by];
    const result = await query(sql, params);
    return result.insertId;
  }

  // 更新团队信息
  static async update(id, teamData) {
    const {
      name,
      description,
      level,
      leader_id,
      target_amount,
      status
    } = teamData;

    const sql = `
      UPDATE teams SET
        name = ?, description = ?, level = ?, leader_id = ?, 
        target_amount = ?, status = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;

    const params = [name, description, level, leader_id, target_amount, status, id];
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除团队（软删除）
  static async delete(id) {
    return await transaction(async (connection) => {
      // 检查团队是否有成员
      const memberCheckSql = 'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL';
      const [{ count }] = await connection.execute(memberCheckSql, [id]);
      
      if (count > 0) {
        throw new Error('团队还有成员，无法删除');
      }

      // 软删除团队
      const deleteSql = 'UPDATE teams SET deleted_at = NOW() WHERE id = ?';
      const result = await connection.execute(deleteSql, [id]);
      return result[0].affectedRows > 0;
    });
  }

  // 获取团队成员列表
  static async getMembers(teamId, options = {}) {
    const { page = 1, pageSize = 10, role = '' } = options;

    let whereConditions = ['u.team_id = ?', 'u.deleted_at IS NULL'];
    let params = [teamId];

    // 角色筛选
    if (role) {
      whereConditions.push('u.role = ?');
      params.push(role);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const [{ total }] = await query(countSql, params);

    // 查询列表数据
    const offset = (page - 1) * pageSize;
    const listSql = `
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM customers WHERE assigned_to = u.id AND deleted_at IS NULL) as customer_count,
        (SELECT COUNT(*) FROM follow_records WHERE user_id = u.id AND deleted_at IS NULL) as follow_count
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(pageSize, offset);
    const list = await query(listSql, params);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // 添加团队成员
  static async addMember(teamId, userId) {
    const sql = 'UPDATE users SET team_id = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL';
    const result = await query(sql, [teamId, userId]);
    return result.affectedRows > 0;
  }

  // 移除团队成员
  static async removeMember(teamId, userId) {
    const sql = 'UPDATE users SET team_id = NULL, updated_at = NOW() WHERE id = ? AND team_id = ? AND deleted_at IS NULL';
    const result = await query(sql, [userId, teamId]);
    return result.affectedRows > 0;
  }

  // 获取团队统计数据
  static async getStatistics(teamId, options = {}) {
    const { startDate, endDate } = options;

    let whereConditions = ['u.team_id = ?', 'c.deleted_at IS NULL'];
    let params = [teamId];

    // 时间范围过滤
    if (startDate) {
      whereConditions.push('c.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('c.created_at <= ?');
      params.push(endDate);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const sql = `
      SELECT 
        COUNT(DISTINCT u.id) as member_count,
        COUNT(c.id) as total_customers,
        COUNT(CASE WHEN c.status = 'potential' THEN 1 END) as potential_customers,
        COUNT(CASE WHEN c.status = 'contacted' THEN 1 END) as contacted_customers,
        COUNT(CASE WHEN c.status = 'interested' THEN 1 END) as interested_customers,
        COUNT(CASE WHEN c.status = 'deal' THEN 1 END) as deal_customers,
        COUNT(CASE WHEN c.status = 'invalid' THEN 1 END) as invalid_customers,
        AVG(c.level) as avg_customer_level,
        (SELECT COUNT(*) FROM follow_records fr 
         JOIN users u2 ON fr.user_id = u2.id 
         WHERE u2.team_id = ? AND fr.deleted_at IS NULL
         ${startDate ? 'AND fr.created_at >= ?' : ''}
         ${endDate ? 'AND fr.created_at <= ?' : ''}
        ) as total_follow_records
      FROM users u
      LEFT JOIN customers c ON c.assigned_to = u.id
      ${whereClause}
    `;

    // 为跟进记录统计添加参数
    const statsParams = [...params, teamId];
    if (startDate) statsParams.push(startDate);
    if (endDate) statsParams.push(endDate);

    const [statistics] = await query(sql, statsParams);
    return statistics;
  }

  // 获取所有团队（用于下拉选择）
  static async getAll() {
    const sql = `
      SELECT 
        t.id, 
        t.name, 
        t.level,
        u.name as leader_name,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL) as member_count
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.deleted_at IS NULL AND t.status = 'active'
      ORDER BY t.level ASC, t.name ASC
    `;
    return await query(sql);
  }

  // 检查团队名称是否存在
  static async checkNameExists(name, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM teams WHERE name = ? AND deleted_at IS NULL';
    let params = [name];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const [{ count }] = await query(sql, params);
    return count > 0;
  }
}

module.exports = Team; 
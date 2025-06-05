const { query, transaction } = require('../config/database');

class FollowRecord {
  // 获取跟进记录列表
  static async getList(options = {}) {
    const {
      page = 1,
      pageSize = 10,
      customerId = '',
      userId = '',
      userRole = '',
      teamId = '',
      startDate = '',
      endDate = '',
      search = ''
    } = options;

    let whereConditions = [];
    let params = [];

    // 根据用户角色添加权限过滤
    if (userRole === 'sales') {
      whereConditions.push('fr.sales_id = ?');
      params.push(userId);
    } else if (userRole === 'leader' && teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    // 客户ID过滤
    if (customerId) {
      whereConditions.push('fr.customer_id = ?');
      params.push(customerId);
    }

    // 用户ID过滤
    if (userId && userRole !== 'sales') {
      whereConditions.push('fr.sales_id = ?');
      params.push(userId);
    }

    // 时间范围过滤
    if (startDate) {
      whereConditions.push('DATE(fr.created_at) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('DATE(fr.created_at) <= ?');
      params.push(endDate);
    }

    // 搜索过滤
    if (search) {
      whereConditions.push('(fr.content LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 查询总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM follow_records fr
      LEFT JOIN users u ON fr.sales_id = u.id
      LEFT JOIN customers c ON fr.customer_id = c.id
      ${whereClause}
    `;
    const [{ total }] = await query(countSql, params);

    // 查询列表数据
    const offset = (page - 1) * pageSize;
    const listSql = `
      SELECT 
        fr.*,
        u.name as user_name,
        u.phone as user_phone,
        c.name as customer_name,
        c.phone as customer_phone,
        c.company as customer_company
      FROM follow_records fr
      LEFT JOIN users u ON fr.sales_id = u.id
      LEFT JOIN customers c ON fr.customer_id = c.id
      ${whereClause}
      ORDER BY fr.created_at DESC
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

  // 根据ID获取跟进记录详情
  static async getById(id) {
    const sql = `
      SELECT 
        fr.*,
        u.name as user_name,
        u.phone as user_phone,
        c.name as customer_name,
        c.phone as customer_phone,
        c.company as customer_company
      FROM follow_records fr
      LEFT JOIN users u ON fr.sales_id = u.id
      LEFT JOIN customers c ON fr.customer_id = c.id
      WHERE fr.id = ?
    `;
    const [record] = await query(sql, [id]);
    return record;
  }

  // 创建跟进记录
  static async create(recordData) {
    const {
      customer_id,
      user_id,
      content,
      follow_type = 'phone',
      next_follow_time = null,
      remark = ''
    } = recordData;

    const sql = `
      INSERT INTO follow_records (
        customer_id, sales_id, content, follow_time, created_at
      ) VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
    `;

    const params = [customer_id, user_id, content, next_follow_time || new Date().toISOString()];
    const result = await query(sql, params);
    return result.insertId || result.lastID;
  }

  // 更新跟进记录
  static async update(id, recordData) {
    const {
      content,
      follow_type,
      next_follow_time,
      remark
    } = recordData;

    const sql = `
      UPDATE follow_records SET
        content = ?, follow_time = ?
      WHERE id = ?
    `;

    const params = [content, next_follow_time, id];
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除跟进记录
  static async delete(id) {
    const sql = 'DELETE FROM follow_records WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 获取客户的跟进记录
  static async getByCustomerId(customerId, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    const offset = (page - 1) * pageSize;

    const sql = `
      SELECT 
        fr.*,
        u.name as user_name,
        u.phone as user_phone
      FROM follow_records fr
      LEFT JOIN users u ON fr.sales_id = u.id
      WHERE fr.customer_id = ?
      ORDER BY fr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const list = await query(sql, [customerId, pageSize, offset]);

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM follow_records
      WHERE customer_id = ?
    `;
    const [{ total }] = await query(countSql, [customerId]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // 获取跟进统计数据
  static async getStatistics(options = {}) {
    const { userId, userRole, teamId, startDate, endDate } = options;

    let whereConditions = [];
    let params = [];

    // 根据用户角色添加权限过滤
    if (userRole === 'sales') {
      whereConditions.push('fr.sales_id = ?');
      params.push(userId);
    } else if (userRole === 'leader' && teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    // 时间范围过滤
    if (startDate) {
      whereConditions.push('DATE(fr.created_at) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('DATE(fr.created_at) <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT fr.customer_id) as followed_customers,
        COUNT(DISTINCT fr.sales_id) as active_users
      FROM follow_records fr
      LEFT JOIN users u ON fr.sales_id = u.id
      ${whereClause}
    `;

    const [statistics] = await query(sql, params);
    return statistics;
  }

  // 获取待跟进客户列表
  static async getPendingFollowUps(options = {}) {
    const { userId, userRole, teamId } = options;

    let whereConditions = ['c.deleted_at IS NULL'];
    let params = [];

    // 根据用户角色添加权限过滤
    if (userRole === 'sales') {
      whereConditions.push('c.owner_id = ?');
      params.push(userId);
    } else if (userRole === 'leader' && teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        c.*,
        u.name as assigned_name,
        (SELECT content FROM follow_records 
         WHERE customer_id = c.id 
         ORDER BY created_at DESC LIMIT 1) as last_follow_content
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      ${whereClause}
      ORDER BY c.last_follow_time ASC
    `;

    const list = await query(sql, params);
    return list;
  }
}

module.exports = FollowRecord; 
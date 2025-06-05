const { query, transaction } = require('../config/database');

class Customer {
  // 获取客户列表（支持分页、搜索、筛选）
  static async getList(options = {}) {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      status = '',
      level = '',
      assignedTo = '',
      teamId = '',
      userRole = '',
      userId = ''
    } = options;

    let whereConditions = ['c.deleted_at IS NULL'];
    let params = [];

    // 根据用户角色添加数据权限过滤
    if (userRole === 'sales') {
      whereConditions.push('c.owner_id = ?');
      params.push(userId);
    } else if (userRole === 'leader' && teamId) {
      whereConditions.push('u.team_id = ?');
      params.push(teamId);
    }

    // 搜索条件
    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.phone LIKE ? OR c.company LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // 状态筛选
    if (status) {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    // 星级筛选
    if (level) {
      whereConditions.push('c.star_level = ?');
      params.push(level);
    }

    // 归属人筛选
    if (assignedTo) {
      whereConditions.push('c.owner_id = ?');
      params.push(assignedTo);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 查询总数
    const countSql = `
      SELECT COUNT(*) as total
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      ${whereClause}
    `;
    const [{ total }] = await query(countSql, params);

    // 查询列表数据
    const offset = (page - 1) * pageSize;
    const listSql = `
      SELECT 
        c.*,
        u.name as assigned_name,
        u.phone as assigned_phone,
        t.name as team_name,
        (SELECT COUNT(*) FROM follow_records WHERE customer_id = c.id AND deleted_at IS NULL) as follow_count,
        (SELECT created_at FROM follow_records WHERE customer_id = c.id AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1) as last_follow_time
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      LEFT JOIN teams t ON u.team_id = t.id
      ${whereClause}
      ORDER BY c.created_at DESC
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

  // 根据ID获取客户详情
  static async getById(id) {
    const sql = `
      SELECT 
        c.*,
        u.name as assigned_name,
        u.phone as assigned_phone,
        u.role as assigned_role,
        t.name as team_name
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `;
    const [customer] = await query(sql, [id]);
    return customer;
  }

  // 创建客户
  static async create(customerData) {
    const {
      name,
      phone,
      email = '',
      company = '',
      position = '',
      address = '',
      source = '',
      level = 1,
      status = 'potential',
      owner_id,
      remark = '',
      created_by
    } = customerData;

    const sql = `
      INSERT INTO customers (
        name, phone, email, company, position, address, source,
        level, status, owner_id, remark, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      name, phone, email, company, position, address, source,
      level, status, owner_id, remark, created_by
    ];

    const result = await query(sql, params);
    return result.insertId;
  }

  // 更新客户信息
  static async update(id, customerData) {
    const {
      name,
      phone,
      email,
      company,
      position,
      address,
      source,
      level,
      status,
      owner_id,
      remark
    } = customerData;

    const sql = `
      UPDATE customers SET
        name = ?, phone = ?, email = ?, company = ?, position = ?,
        address = ?, source = ?, level = ?, status = ?, owner_id = ?,
        remark = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;

    const params = [
      name, phone, email, company, position, address, source,
      level, status, owner_id, remark, id
    ];

    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  // 删除客户（软删除）
  static async delete(id) {
    const sql = 'UPDATE customers SET deleted_at = NOW() WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  // 批量转移客户
  static async transfer(customerIds, fromUserId, toUserId, operatorId) {
    return await transaction(async (connection) => {
      // 更新客户归属
      const updateSql = `
        UPDATE customers SET owner_id = ?, updated_at = NOW()
        WHERE id IN (${customerIds.map(() => '?').join(',')}) AND owner_id = ?
      `;
      await connection.execute(updateSql, [toUserId, ...customerIds, fromUserId]);

      // 记录操作日志
      const logSql = `
        INSERT INTO operation_logs (user_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'transfer', 'customer', ?, ?, NOW())
      `;
      const details = JSON.stringify({
        from_user: fromUserId,
        to_user: toUserId,
        customer_count: customerIds.length
      });
      await connection.execute(logSql, [operatorId, customerIds[0], details]);

      return true;
    });
  }

  // 批量导入客户
  static async batchImport(customers, userId) {
    return await transaction(async (connection) => {
      let successCount = 0;
      let failedCount = 0;
      const errors = [];

      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        try {
          // 检查手机号是否已存在
          const checkSql = 'SELECT id FROM customers WHERE phone = ? AND deleted_at IS NULL';
          const [existing] = await connection.execute(checkSql, [customer.phone]);
          
          if (existing.length > 0) {
            failedCount++;
            errors.push(`第${i + 1}行：手机号 ${customer.phone} 已存在`);
            continue;
          }

          const sql = `
            INSERT INTO customers (
              name, phone, gender, age, star_level, qualification, requirements,
              email, company, position, address, source, level, status, 
              owner_id, remark, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;

          const params = [
            customer.name,
            customer.phone,
            customer.gender || 'male',
            customer.age || null,
            customer.starLevel || 1,
            customer.qualification || '',
            customer.requirements || '',
            customer.email || '',
            customer.company || '',
            customer.position || '',
            customer.address || '',
            'import',
            customer.starLevel || 1, // level字段保持兼容
            'potential',
            userId, // 所有导入的客户都归属到总经理
            customer.remark || '',
            userId
          ];

          await connection.execute(sql, params);
          successCount++;
        } catch (error) {
          failedCount++;
          errors.push(`第${i + 1}行：${error.message}`);
        }
      }

      return {
        total: customers.length,
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // 只返回前10个错误
      };
    });
  }

  // 获取客户统计数据
  static async getStatistics(options = {}) {
    const { userId, userRole, teamId, startDate, endDate } = options;

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

    // 时间范围过滤
    if (startDate) {
      whereConditions.push('c.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('c.created_at <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN c.status = 'potential' THEN 1 END) as potential_customers,
        COUNT(CASE WHEN c.status = 'contacted' THEN 1 END) as contacted_customers,
        COUNT(CASE WHEN c.status = 'interested' THEN 1 END) as interested_customers,
        COUNT(CASE WHEN c.status = 'deal' THEN 1 END) as deal_customers,
        COUNT(CASE WHEN c.status = 'invalid' THEN 1 END) as invalid_customers,
        AVG(c.level) as avg_level
      FROM customers c
      LEFT JOIN users u ON c.owner_id = u.id
      ${whereClause}
    `;

    const [statistics] = await query(sql, params);
    return statistics;
  }
}

module.exports = Customer; 
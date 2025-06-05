const Customer = require('../models/Customer');
const { success, badRequest, notFound, serverError } = require('../utils/response');
const { validate } = require('../utils/validation');

class CustomerController {
  // 获取客户列表
  static async getList(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = '',
        status = '',
        level = '',
        assignedTo = ''
      } = req.query;

      const options = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        search,
        status,
        level,
        assignedTo,
        userRole: req.user.role,
        userId: req.user.id,
        teamId: req.user.team_id
      };

      const result = await Customer.getList(options);
      res.json(success(result, '获取客户列表成功'));
    } catch (error) {
      console.error('获取客户列表失败:', error);
      res.status(500).json(serverError('获取客户列表失败'));
    }
  }

  // 获取客户详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.getById(id);

      if (!customer) {
        return res.status(404).json(notFound('客户不存在'));
      }

      // 权限检查
      if (req.user.role === 'sales' && customer.owner_id !== req.user.id) {
        return res.status(403).json(badRequest('无权访问此客户'));
      }

      res.json(success(customer, '获取客户详情成功'));
    } catch (error) {
      console.error('获取客户详情失败:', error);
      res.status(500).json(serverError('获取客户详情失败'));
    }
  }

  // 创建客户
  static async create(req, res) {
    try {
      const customerData = {
        ...req.body,
        created_by: req.user.id,
        owner_id: req.body.owner_id || req.user.id
      };

      const customerId = await Customer.create(customerData);
      res.json(success({ id: customerId }, '创建客户成功'));
    } catch (error) {
      console.error('创建客户失败:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json(badRequest('客户手机号已存在'));
      } else {
        res.status(500).json(serverError('创建客户失败'));
      }
    }
  }

  // 更新客户信息
  static async update(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.getById(id);

      if (!customer) {
        return res.status(404).json(notFound('客户不存在'));
      }

      // 注意：权限检查已在路由层完成，只有管理员和总经理可以访问此方法

      const success_update = await Customer.update(id, req.body);
      if (success_update) {
        res.json(success(null, '更新客户成功'));
      } else {
        res.status(400).json(badRequest('更新客户失败'));
      }
    } catch (error) {
      console.error('更新客户失败:', error);
      res.status(500).json(serverError('更新客户失败'));
    }
  }

  // 删除客户
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const customer = await Customer.getById(id);

      if (!customer) {
        return res.status(404).json(notFound('客户不存在'));
      }

      // 权限检查：只有管理员和组长可以删除客户
      if (req.user.role === 'sales') {
        return res.status(403).json(badRequest('无权删除客户'));
      }

      const success_delete = await Customer.delete(id);
      if (success_delete) {
        res.json(success(null, '删除客户成功'));
      } else {
        res.status(400).json(badRequest('删除客户失败'));
      }
    } catch (error) {
      console.error('删除客户失败:', error);
      res.status(500).json(serverError('删除客户失败'));
    }
  }

  // 转移客户
  static async transfer(req, res) {
    try {
      const { customerIds, fromUserId, toUserId } = req.body;

      // 权限检查：只有管理员和组长可以转移客户
      if (req.user.role === 'sales') {
        return res.status(403).json(badRequest('无权转移客户'));
      }

      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return res.status(400).json(badRequest('请选择要转移的客户'));
      }

      const success_transfer = await Customer.transfer(customerIds, fromUserId, toUserId, req.user.id);
      if (success_transfer) {
        res.json(success(null, '转移客户成功'));
      } else {
        res.status(400).json(badRequest('转移客户失败'));
      }
    } catch (error) {
      console.error('转移客户失败:', error);
      res.status(500).json(serverError('转移客户失败'));
    }
  }

  // 批量导入客户
  static async batchImport(req, res) {
    try {
      const { customers } = req.body;

      if (!Array.isArray(customers) || customers.length === 0) {
        return res.status(400).json(badRequest('导入数据不能为空'));
      }

      // 数据验证
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        if (!customer.name || !customer.phone) {
          return res.status(400).json(badRequest(`第${i + 1}行数据缺少必填字段（姓名、电话）`));
        }
        
        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(customer.phone)) {
          return res.status(400).json(badRequest(`第${i + 1}行手机号格式不正确`));
        }
        
        // 验证星级范围
        if (customer.starLevel && (customer.starLevel < 1 || customer.starLevel > 5)) {
          return res.status(400).json(badRequest(`第${i + 1}行客户星级必须在1-5之间`));
        }
      }

      const result = await Customer.batchImport(customers, req.user.id);
      res.json(success(result, `导入完成！成功${result.success}条，失败${result.failed}条`));
    } catch (error) {
      console.error('批量导入客户失败:', error);
      res.status(500).json(serverError('批量导入客户失败'));
    }
  }

  // 获取客户统计数据
  static async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id,
        startDate,
        endDate
      };

      const statistics = await Customer.getStatistics(options);
      res.json(success(statistics, '获取客户统计成功'));
    } catch (error) {
      console.error('获取客户统计失败:', error);
      res.status(500).json(serverError('获取客户统计失败'));
    }
  }
}

module.exports = CustomerController; 
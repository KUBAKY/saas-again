const FollowRecord = require('../models/FollowRecord');
const Customer = require('../models/Customer');
const { success, badRequest, notFound, serverError } = require('../utils/response');

class FollowRecordController {
  // 获取跟进记录列表
  static async getList(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        customerId = '',
        userId = '',
        startDate = '',
        endDate = '',
        search = ''
      } = req.query;

      const options = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        customerId,
        userId,
        userRole: req.user.role,
        teamId: req.user.team_id,
        startDate,
        endDate,
        search
      };

      const result = await FollowRecord.getList(options);
      res.json(success(result, '获取跟进记录列表成功'));
    } catch (error) {
      console.error('获取跟进记录列表失败:', error);
      res.status(500).json(serverError('获取跟进记录列表失败'));
    }
  }

  // 获取跟进记录详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const record = await FollowRecord.getById(id);

      if (!record) {
        return res.status(404).json(notFound('跟进记录不存在'));
      }

      // 权限检查
      if (req.user.role === 'sales' && record.user_id !== req.user.id) {
        return res.status(403).json(badRequest('无权访问此跟进记录'));
      }

      res.json(success(record, '获取跟进记录详情成功'));
    } catch (error) {
      console.error('获取跟进记录详情失败:', error);
      res.status(500).json(serverError('获取跟进记录详情失败'));
    }
  }

  // 创建跟进记录
  static async create(req, res) {
    try {
      const { customer_id, content, follow_type, next_follow_time, remark } = req.body;

      // 检查客户是否存在
      const customer = await Customer.getById(customer_id);
      if (!customer) {
        return res.status(404).json(notFound('客户不存在'));
      }

      // 权限检查：销售员只能为自己的客户添加跟进记录
      if (req.user.role === 'sales' && customer.assigned_to !== req.user.id) {
        return res.status(403).json(badRequest('无权为此客户添加跟进记录'));
      }

      const recordData = {
        customer_id,
        user_id: req.user.id,
        content,
        follow_type,
        next_follow_time,
        remark
      };

      const recordId = await FollowRecord.create(recordData);
      res.json(success({ id: recordId }, '创建跟进记录成功'));
    } catch (error) {
      console.error('创建跟进记录失败:', error);
      res.status(500).json(serverError('创建跟进记录失败'));
    }
  }

  // 更新跟进记录
  static async update(req, res) {
    try {
      const { id } = req.params;
      const record = await FollowRecord.getById(id);

      if (!record) {
        return res.status(404).json(notFound('跟进记录不存在'));
      }

      // 权限检查：只能修改自己的跟进记录
      if (record.user_id !== req.user.id) {
        return res.status(403).json(badRequest('无权修改此跟进记录'));
      }

      const success_update = await FollowRecord.update(id, req.body);
      if (success_update) {
        res.json(success(null, '更新跟进记录成功'));
      } else {
        res.status(400).json(badRequest('更新跟进记录失败'));
      }
    } catch (error) {
      console.error('更新跟进记录失败:', error);
      res.status(500).json(serverError('更新跟进记录失败'));
    }
  }

  // 删除跟进记录
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const record = await FollowRecord.getById(id);

      if (!record) {
        return res.status(404).json(notFound('跟进记录不存在'));
      }

      // 权限检查：只能删除自己的跟进记录，或管理员/组长可以删除
      if (req.user.role === 'sales' && record.user_id !== req.user.id) {
        return res.status(403).json(badRequest('无权删除此跟进记录'));
      }

      const success_delete = await FollowRecord.delete(id);
      if (success_delete) {
        res.json(success(null, '删除跟进记录成功'));
      } else {
        res.status(400).json(badRequest('删除跟进记录失败'));
      }
    } catch (error) {
      console.error('删除跟进记录失败:', error);
      res.status(500).json(serverError('删除跟进记录失败'));
    }
  }

  // 获取客户的跟进记录
  static async getByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      const { page = 1, pageSize = 10 } = req.query;

      // 检查客户是否存在
      const customer = await Customer.getById(customerId);
      if (!customer) {
        return res.status(404).json(notFound('客户不存在'));
      }

      // 权限检查
      if (req.user.role === 'sales' && customer.assigned_to !== req.user.id) {
        return res.status(403).json(badRequest('无权访问此客户的跟进记录'));
      }

      const options = {
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      };

      const result = await FollowRecord.getByCustomerId(customerId, options);
      res.json(success(result, '获取客户跟进记录成功'));
    } catch (error) {
      console.error('获取客户跟进记录失败:', error);
      res.status(500).json(serverError('获取客户跟进记录失败'));
    }
  }

  // 获取跟进统计数据
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

      const statistics = await FollowRecord.getStatistics(options);
      res.json(success(statistics, '获取跟进统计成功'));
    } catch (error) {
      console.error('获取跟进统计失败:', error);
      res.status(500).json(serverError('获取跟进统计失败'));
    }
  }

  // 获取待跟进客户列表
  static async getPendingFollowUps(req, res) {
    try {
      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id
      };

      const list = await FollowRecord.getPendingFollowUps(options);
      res.json(success(list, '获取待跟进客户列表成功'));
    } catch (error) {
      console.error('获取待跟进客户列表失败:', error);
      res.status(500).json(serverError('获取待跟进客户列表失败'));
    }
  }
}

module.exports = FollowRecordController; 
const User = require('../models/User');
const { success, badRequest, notFound, serverError } = require('../utils/response');

class UserController {
  // 获取用户列表
  static async getList(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = '',
        role = '',
        teamId = '',
        status = 'active'
      } = req.query;

      const options = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        search,
        role,
        teamId,
        status,
        userRole: req.user.role,
        currentUserId: req.user.id,
        currentUserTeamId: req.user.team_id
      };

      const result = await User.getList(options);
      res.json(success(result, '获取用户列表成功'));
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.status(500).json(serverError('获取用户列表失败'));
    }
  }

  // 获取用户详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getById(id);

      if (!user) {
        return res.status(404).json(notFound('用户不存在'));
      }

      // 权限检查：销售员只能查看自己的信息
      if (req.user.role === 'sales' && parseInt(id) !== req.user.id) {
        return res.status(403).json(badRequest('无权访问此用户信息'));
      }

      // 移除敏感信息
      delete user.password;
      res.json(success(user, '获取用户详情成功'));
    } catch (error) {
      console.error('获取用户详情失败:', error);
      res.status(500).json(serverError('获取用户详情失败'));
    }
  }

  // 创建用户
  static async create(req, res) {
    try {
      const { name, phone, email, role, team_id, password } = req.body;

      // 权限检查：只有系统管理员可以创建系统管理员用户
      if (role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json(badRequest('只有系统管理员可以创建系统管理员用户'));
      }

      // 检查手机号是否已存在
      const phoneExists = await User.checkPhoneExists(phone);
      if (phoneExists) {
        return res.status(400).json(badRequest('手机号已存在'));
      }

      // 检查邮箱是否已存在
      if (email) {
        const emailExists = await User.checkEmailExists(email);
        if (emailExists) {
          return res.status(400).json(badRequest('邮箱已存在'));
        }
      }

      // 如果没有提供密码，自动设置为手机号后6位
      const finalPassword = password || phone.slice(-6);

      const userData = {
        name,
        phone,
        email,
        role,
        team_id,
        password: finalPassword,
        created_by: req.user.id
      };

      const userId = await User.create(userData);
      res.json(success({ id: userId }, '创建用户成功'));
    } catch (error) {
      console.error('创建用户失败:', error);
      res.status(500).json(serverError('创建用户失败'));
    }
  }

  // 更新用户信息
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, email, role, team_id, status } = req.body;

      const user = await User.getById(id);
      if (!user) {
        return res.status(404).json(notFound('用户不存在'));
      }

      // 权限检查：总经理不能修改系统管理员用户
      if (user.role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json(badRequest('无权修改系统管理员用户'));
      }

      // 权限检查：只有系统管理员可以将用户角色改为系统管理员
      if (role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json(badRequest('只有系统管理员可以设置系统管理员角色'));
      }

      // 权限检查：销售员只能修改自己的基本信息
      if (req.user.role === 'sales') {
        if (parseInt(id) !== req.user.id) {
          return res.status(403).json(badRequest('无权修改此用户信息'));
        }
        // 销售员不能修改角色和团队
        if (role && role !== user.role) {
          return res.status(403).json(badRequest('无权修改用户角色'));
        }
        if (team_id && team_id !== user.team_id) {
          return res.status(403).json(badRequest('无权修改用户团队'));
        }
      }

      // 检查手机号是否已存在（排除当前用户）
      if (phone && phone !== user.phone) {
        const phoneExists = await User.checkPhoneExists(phone, id);
        if (phoneExists) {
          return res.status(400).json(badRequest('手机号已存在'));
        }
      }

      // 检查邮箱是否已存在（排除当前用户）
      if (email && email !== user.email) {
        const emailExists = await User.checkEmailExists(email, id);
        if (emailExists) {
          return res.status(400).json(badRequest('邮箱已存在'));
        }
      }

      const userData = {
        name: name || user.name,
        phone: phone || user.phone,
        email: email !== undefined ? email : user.email,
        role: role || user.role,
        team_id: team_id !== undefined ? team_id : user.team_id,
        status: status || user.status
      };

      const success_update = await User.update(id, userData);
      if (success_update) {
        res.json(success(null, '更新用户成功'));
      } else {
        res.status(400).json(badRequest('更新用户失败'));
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      res.status(500).json(serverError('更新用户失败'));
    }
  }

  // 删除用户
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const user = await User.getById(id);

      if (!user) {
        return res.status(404).json(notFound('用户不存在'));
      }

      // 权限检查：总经理不能删除系统管理员用户
      if (user.role === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json(badRequest('无权删除系统管理员用户'));
      }

      // 不能删除自己
      if (parseInt(id) === req.user.id) {
        return res.status(400).json(badRequest('不能删除自己'));
      }

      const success_delete = await User.delete(id);
      if (success_delete) {
        res.json(success(null, '删除用户成功'));
      } else {
        res.status(400).json(badRequest('删除用户失败'));
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      if (error.message.includes('还有客户')) {
        res.status(400).json(badRequest(error.message));
      } else {
        res.status(500).json(serverError('删除用户失败'));
      }
    }
  }

  // 重置用户密码
  static async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = await User.getById(id);
      if (!user) {
        return res.status(404).json(notFound('用户不存在'));
      }

      const success_reset = await User.updatePassword(id, newPassword);
      if (success_reset) {
        res.json(success(null, '重置密码成功'));
      } else {
        res.status(400).json(badRequest('重置密码失败'));
      }
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(500).json(serverError('重置密码失败'));
    }
  }

  // 获取用户统计数据
  static async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const options = {
        userRole: req.user.role,
        userId: req.user.id,
        teamId: req.user.team_id,
        startDate,
        endDate
      };

      const statistics = await User.getStatistics(options);
      res.json(success(statistics, '获取用户统计成功'));
    } catch (error) {
      console.error('获取用户统计失败:', error);
      res.status(500).json(serverError('获取用户统计失败'));
    }
  }

  // 获取销售员列表（用于下拉选择）
  static async getSalesList(req, res) {
    try {
      const { teamId } = req.query;
      const options = {
        userRole: req.user.role,
        currentUserTeamId: req.user.team_id,
        teamId
      };

      const salesList = await User.getSalesList(options);
      res.json(success(salesList, '获取销售员列表成功'));
    } catch (error) {
      console.error('获取销售员列表失败:', error);
      res.status(500).json(serverError('获取销售员列表失败'));
    }
  }
}

module.exports = UserController; 
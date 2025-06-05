const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, unauthorized, badRequest, serverError } = require('../utils/response');

class AuthController {
  // 用户登录
  static async login(req, res) {
    try {
      const { phone, password } = req.body;

      // 验证用户凭据
      const user = await User.verifyPassword(phone, password);
      if (!user) {
        return res.status(401).json(unauthorized('手机号或密码错误'));
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return res.status(401).json(unauthorized('账号已被停用，请联系管理员'));
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user;

      res.json(success({
        token,
        user: {
          id: userInfo.id,
          phone: userInfo.phone,
          name: userInfo.name,
          role: userInfo.role,
          teamId: userInfo.team_id,
          team: userInfo.team_name ? {
            id: userInfo.team_id,
            name: userInfo.team_name,
            level: userInfo.team_level
          } : null,
          joinDate: userInfo.join_date,
          status: userInfo.status
        }
      }, '登录成功'));

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json(serverError('登录失败，请稍后重试'));
    }
  }

  // 获取当前用户信息
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json(unauthorized('用户不存在'));
      }

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user;

      res.json(success({
        id: userInfo.id,
        phone: userInfo.phone,
        name: userInfo.name,
        role: userInfo.role,
        teamId: userInfo.team_id,
        team: userInfo.team_name ? {
          id: userInfo.team_id,
          name: userInfo.team_name,
          level: userInfo.team_level
        } : null,
        joinDate: userInfo.join_date,
        status: userInfo.status,
        createdAt: userInfo.created_at,
        updatedAt: userInfo.updated_at
      }));

    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json(serverError('获取用户信息失败'));
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      await User.changePassword(userId, oldPassword, newPassword);

      res.json(success(null, '密码修改成功'));

    } catch (error) {
      console.error('修改密码错误:', error);
      
      if (error.message === '用户不存在') {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
          timestamp: Date.now()
        });
      }
      
      if (error.message === '原密码错误') {
        return res.status(400).json(badRequest('原密码错误'));
      }

      res.status(500).json(serverError('密码修改失败'));
    }
  }

  // 刷新token
  static async refreshToken(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user || user.status !== 'active') {
        return res.status(401).json(unauthorized('用户状态异常'));
      }

      // 生成新的JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      res.json(success({ token }, 'Token刷新成功'));

    } catch (error) {
      console.error('刷新Token错误:', error);
      res.status(500).json(serverError('Token刷新失败'));
    }
  }

  // 登出（客户端处理，服务端可记录日志）
  static async logout(req, res) {
    try {
      // 这里可以记录登出日志
      // 实际的token失效由客户端处理（删除本地存储的token）
      
      res.json(success(null, '登出成功'));

    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json(serverError('登出失败'));
    }
  }
}

module.exports = AuthController; 
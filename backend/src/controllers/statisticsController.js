const Customer = require('../models/Customer');
const FollowRecord = require('../models/FollowRecord');
const User = require('../models/User');
const Team = require('../models/Team');
const { success, badRequest, serverError } = require('../utils/response');

class StatisticsController {
  // 获取总体统计数据
  static async getOverview(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id,
        startDate,
        endDate
      };

      // 并行获取各种统计数据
      const [
        customerStats,
        followStats,
        userStats
      ] = await Promise.all([
        Customer.getStatistics(options),
        FollowRecord.getStatistics(options),
        User.getStatistics(options)
      ]);

      const overview = {
        customers: customerStats,
        followRecords: followStats,
        users: userStats,
        summary: {
          totalCustomers: customerStats.total_customers || 0,
          totalFollowRecords: followStats.total_records || 0,
          totalUsers: userStats.total_users || 0,
          dealRate: customerStats.total_customers > 0 
            ? ((customerStats.deal_customers || 0) / customerStats.total_customers * 100).toFixed(2)
            : '0.00'
        }
      };

      res.json(success(overview, '获取统计概览成功'));
    } catch (error) {
      console.error('获取统计概览失败:', error);
      res.status(500).json(serverError('获取统计概览失败'));
    }
  }

  // 获取客户统计数据
  static async getCustomerStatistics(req, res) {
    try {
      const { startDate, endDate, groupBy = 'status' } = req.query;

      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id,
        startDate,
        endDate
      };

      const statistics = await Customer.getStatistics(options);
      
      // 根据groupBy参数返回不同的统计维度
      let result = statistics;
      
      if (groupBy === 'status') {
        result = {
          potential: statistics.potential_customers || 0,
          contacted: statistics.contacted_customers || 0,
          interested: statistics.interested_customers || 0,
          deal: statistics.deal_customers || 0,
          invalid: statistics.invalid_customers || 0,
          total: statistics.total_customers || 0
        };
      } else if (groupBy === 'level') {
        // 这里可以添加按星级分组的统计逻辑
        result = {
          ...statistics,
          avgLevel: parseFloat(statistics.avg_level || 0).toFixed(1)
        };
      }

      res.json(success(result, '获取客户统计成功'));
    } catch (error) {
      console.error('获取客户统计失败:', error);
      res.status(500).json(serverError('获取客户统计失败'));
    }
  }

  // 获取跟进记录统计数据
  static async getFollowRecordStatistics(req, res) {
    try {
      const { startDate, endDate, groupBy = 'type' } = req.query;

      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id,
        startDate,
        endDate
      };

      const statistics = await FollowRecord.getStatistics(options);
      
      let result = statistics;
      
      if (groupBy === 'type') {
        result = {
          phone: statistics.phone_records || 0,
          email: statistics.email_records || 0,
          visit: statistics.visit_records || 0,
          wechat: statistics.wechat_records || 0,
          total: statistics.total_records || 0,
          followedCustomers: statistics.followed_customers || 0,
          activeUsers: statistics.active_users || 0
        };
      }

      res.json(success(result, '获取跟进记录统计成功'));
    } catch (error) {
      console.error('获取跟进记录统计失败:', error);
      res.status(500).json(serverError('获取跟进记录统计失败'));
    }
  }

  // 获取团队统计数据
  static async getTeamStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // 只有管理员可以查看所有团队统计，组长只能查看自己团队的统计
      if (req.user.role === 'sales') {
        return res.status(403).json(badRequest('无权查看团队统计'));
      }

      let teamIds = [];
      
      if (req.user.role === 'manager') {
        // 管理员可以查看所有团队
        const teams = await Team.getAll();
        teamIds = teams.map(team => team.id);
      } else if (req.user.role === 'leader' && req.user.team_id) {
        // 组长只能查看自己的团队
        teamIds = [req.user.team_id];
      }

      const teamStatistics = [];
      
      for (const teamId of teamIds) {
        const options = { startDate, endDate };
        const stats = await Team.getStatistics(teamId, options);
        const team = await Team.getById(teamId);
        
        teamStatistics.push({
          teamId,
          teamName: team.name,
          teamLevel: team.level,
          leaderName: team.leader_name,
          ...stats
        });
      }

      res.json(success(teamStatistics, '获取团队统计成功'));
    } catch (error) {
      console.error('获取团队统计失败:', error);
      res.status(500).json(serverError('获取团队统计失败'));
    }
  }

  // 获取用户绩效统计
  static async getUserPerformance(req, res) {
    try {
      const { startDate, endDate, teamId } = req.query;

      // 权限检查
      if (req.user.role === 'sales') {
        return res.status(403).json(badRequest('无权查看用户绩效统计'));
      }

      const options = {
        userRole: req.user.role,
        userId: req.user.id,
        teamId: teamId || req.user.team_id,
        startDate,
        endDate
      };

      const userStats = await User.getStatistics(options);
      
      res.json(success(userStats, '获取用户绩效统计成功'));
    } catch (error) {
      console.error('获取用户绩效统计失败:', error);
      res.status(500).json(serverError('获取用户绩效统计失败'));
    }
  }

  // 获取待跟进提醒
  static async getPendingReminders(req, res) {
    try {
      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id
      };

      const pendingFollowUps = await FollowRecord.getPendingFollowUps(options);
      
      res.json(success(pendingFollowUps, '获取待跟进提醒成功'));
    } catch (error) {
      console.error('获取待跟进提醒失败:', error);
      res.status(500).json(serverError('获取待跟进提醒失败'));
    }
  }

  // 获取数据趋势分析
  static async getTrendAnalysis(req, res) {
    try {
      const { type = 'customer', period = '7d' } = req.query;

      // 根据period计算日期范围
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const options = {
        userId: req.user.id,
        userRole: req.user.role,
        teamId: req.user.team_id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      let trendData = {};
      
      if (type === 'customer') {
        trendData = await Customer.getStatistics(options);
      } else if (type === 'follow') {
        trendData = await FollowRecord.getStatistics(options);
      }

      res.json(success(trendData, '获取趋势分析成功'));
    } catch (error) {
      console.error('获取趋势分析失败:', error);
      res.status(500).json(serverError('获取趋势分析失败'));
    }
  }
}

module.exports = StatisticsController; 
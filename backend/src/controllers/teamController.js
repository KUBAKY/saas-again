const Team = require('../models/Team');
const User = require('../models/User');
const { success, badRequest, notFound, serverError } = require('../utils/response');

class TeamController {
  // 获取团队列表
  static async getList(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        search = '',
        level = '',
        status = 'active'
      } = req.query;

      const options = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        search,
        level,
        status
      };

      const result = await Team.getList(options);
      res.json(success(result, '获取团队列表成功'));
    } catch (error) {
      console.error('获取团队列表失败:', error);
      res.status(500).json(serverError('获取团队列表失败'));
    }
  }

  // 获取团队详情
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const team = await Team.getById(id);

      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      res.json(success(team, '获取团队详情成功'));
    } catch (error) {
      console.error('获取团队详情失败:', error);
      res.status(500).json(serverError('获取团队详情失败'));
    }
  }

  // 创建团队
  static async create(req, res) {
    try {
      const { name, description, level, leader_id, target_amount } = req.body;

      // 检查团队名称是否已存在
      const nameExists = await Team.checkNameExists(name);
      if (nameExists) {
        return res.status(400).json(badRequest('团队名称已存在'));
      }

      // 如果指定了组长，检查用户是否存在且角色合适
      if (leader_id) {
        const leader = await User.getById(leader_id);
        if (!leader) {
          return res.status(400).json(badRequest('指定的组长不存在'));
        }
        if (leader.role !== 'leader' && leader.role !== 'manager') {
          return res.status(400).json(badRequest('只能指定组长或管理员作为团队负责人'));
        }
      }

      const teamData = {
        name,
        description,
        level,
        leader_id,
        target_amount,
        created_by: req.user.id
      };

      const teamId = await Team.create(teamData);
      res.json(success({ id: teamId }, '创建团队成功'));
    } catch (error) {
      console.error('创建团队失败:', error);
      res.status(500).json(serverError('创建团队失败'));
    }
  }

  // 更新团队信息
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, level, leader_id, target_amount, status } = req.body;

      const team = await Team.getById(id);
      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      // 检查团队名称是否已存在（排除当前团队）
      if (name && name !== team.name) {
        const nameExists = await Team.checkNameExists(name, id);
        if (nameExists) {
          return res.status(400).json(badRequest('团队名称已存在'));
        }
      }

      // 如果指定了组长，检查用户是否存在且角色合适
      if (leader_id && leader_id !== team.leader_id) {
        const leader = await User.getById(leader_id);
        if (!leader) {
          return res.status(400).json(badRequest('指定的组长不存在'));
        }
        if (leader.role !== 'leader' && leader.role !== 'manager') {
          return res.status(400).json(badRequest('只能指定组长或管理员作为团队负责人'));
        }
      }

      const teamData = {
        name: name || team.name,
        description: description !== undefined ? description : team.description,
        level: level || team.level,
        leader_id: leader_id !== undefined ? leader_id : team.leader_id,
        target_amount: target_amount !== undefined ? target_amount : team.target_amount,
        status: status || team.status
      };

      const success_update = await Team.update(id, teamData);
      if (success_update) {
        res.json(success(null, '更新团队成功'));
      } else {
        res.status(400).json(badRequest('更新团队失败'));
      }
    } catch (error) {
      console.error('更新团队失败:', error);
      res.status(500).json(serverError('更新团队失败'));
    }
  }

  // 删除团队
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const team = await Team.getById(id);

      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      const success_delete = await Team.delete(id);
      if (success_delete) {
        res.json(success(null, '删除团队成功'));
      } else {
        res.status(400).json(badRequest('删除团队失败'));
      }
    } catch (error) {
      console.error('删除团队失败:', error);
      if (error.message === '团队还有成员，无法删除') {
        res.status(400).json(badRequest(error.message));
      } else {
        res.status(500).json(serverError('删除团队失败'));
      }
    }
  }

  // 获取团队成员列表
  static async getMembers(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 10, role = '' } = req.query;

      const team = await Team.getById(id);
      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      const options = {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        role
      };

      const result = await Team.getMembers(id, options);
      res.json(success(result, '获取团队成员列表成功'));
    } catch (error) {
      console.error('获取团队成员列表失败:', error);
      res.status(500).json(serverError('获取团队成员列表失败'));
    }
  }

  // 添加团队成员
  static async addMember(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const team = await Team.getById(id);
      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      const user = await User.getById(userId);
      if (!user) {
        return res.status(400).json(badRequest('用户不存在'));
      }

      if (user.team_id) {
        return res.status(400).json(badRequest('用户已属于其他团队'));
      }

      const success_add = await Team.addMember(id, userId);
      if (success_add) {
        res.json(success(null, '添加团队成员成功'));
      } else {
        res.status(400).json(badRequest('添加团队成员失败'));
      }
    } catch (error) {
      console.error('添加团队成员失败:', error);
      res.status(500).json(serverError('添加团队成员失败'));
    }
  }

  // 移除团队成员
  static async removeMember(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const team = await Team.getById(id);
      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      const user = await User.getById(userId);
      if (!user) {
        return res.status(400).json(badRequest('用户不存在'));
      }

      if (user.team_id !== parseInt(id)) {
        return res.status(400).json(badRequest('用户不属于此团队'));
      }

      // 不能移除团队负责人
      if (team.leader_id === userId) {
        return res.status(400).json(badRequest('不能移除团队负责人'));
      }

      const success_remove = await Team.removeMember(id, userId);
      if (success_remove) {
        res.json(success(null, '移除团队成员成功'));
      } else {
        res.status(400).json(badRequest('移除团队成员失败'));
      }
    } catch (error) {
      console.error('移除团队成员失败:', error);
      res.status(500).json(serverError('移除团队成员失败'));
    }
  }

  // 获取团队统计数据
  static async getStatistics(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const team = await Team.getById(id);
      if (!team) {
        return res.status(404).json(notFound('团队不存在'));
      }

      const options = { startDate, endDate };
      const statistics = await Team.getStatistics(id, options);
      res.json(success(statistics, '获取团队统计成功'));
    } catch (error) {
      console.error('获取团队统计失败:', error);
      res.status(500).json(serverError('获取团队统计失败'));
    }
  }

  // 获取所有团队（用于下拉选择）
  static async getAll(req, res) {
    try {
      const teams = await Team.getAll();
      res.json(success(teams, '获取团队列表成功'));
    } catch (error) {
      console.error('获取团队列表失败:', error);
      res.status(500).json(serverError('获取团队列表失败'));
    }
  }
}

module.exports = TeamController; 
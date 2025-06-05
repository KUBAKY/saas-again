const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户登录
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      phone: '13800000000',
      password: 'admin123'
    });
    return response.data.data.token;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试获取小组列表
async function getTeams(token) {
  try {
    const response = await axios.get(`${BASE_URL}/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.list;
  } catch (error) {
    console.error('获取小组列表失败:', error.response?.data || error.message);
    return [];
  }
}

// 测试获取小组成员
async function getTeamMembers(token, teamId) {
  try {
    const response = await axios.get(`${BASE_URL}/teams/${teamId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('获取小组成员失败:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('开始测试小组成员API...');
  
  // 1. 登录
  console.log('\n1. 登录...');
  const token = await login();
  if (!token) {
    console.log('登录失败，测试终止');
    return;
  }
  console.log('登录成功');

  // 2. 获取小组列表
  console.log('\n2. 获取小组列表...');
  const teams = await getTeams(token);
  console.log(`找到 ${teams.length} 个小组:`);
  teams.forEach(team => {
    console.log(`- ${team.name} (ID: ${team.id}, 成员数: ${team.memberCount})`);
  });

  // 3. 测试获取第一个小组的成员
  if (teams.length > 0) {
    // 找一个有成员的小组
    const teamWithMembers = teams.find(team => team.memberCount > 0);
    if (teamWithMembers) {
      console.log(`\n3. 获取小组 "${teamWithMembers.name}" 的成员...`);
      const members = await getTeamMembers(token, teamWithMembers.id);
      
      if (members) {
        console.log(`小组成员 (${members.length} 人):`);
        if (members.length > 0) {
          members.forEach(member => {
            console.log(`- ${member.name} (${member.phone}) - ${member.role} - 入职: ${member.join_date}`);
          });
        } else {
          console.log('该小组暂无成员');
        }
      }
    } else {
      console.log('\n3. 没有找到有成员的小组');
    }
  }

  console.log('\n测试完成');
}

main().catch(console.error); 
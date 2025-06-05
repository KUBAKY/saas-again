const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户登录信息
const testUser = {
  phone: '13800000000',
  password: 'admin123'
};

let authToken = '';

// 登录获取token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = response.data.data.token;
    console.log('✅ 登录成功');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 创建测试团队
async function createTestTeam() {
  const timestamp = Date.now();
  const teamData = {
    name: `测试组长限制团队_${timestamp}`,
    level: '10'
  };

  try {
    const response = await axios.post(`${BASE_URL}/teams`, teamData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const teamId = response.data.data.id;
    console.log(`✅ 创建测试团队成功: ${teamData.name} (ID: ${teamId})`);
    return teamId;
  } catch (error) {
    console.error('❌ 创建测试团队失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 创建测试用户
async function createTestUser(name, role, teamId = null) {
  const timestamp = Date.now();
  const userData = {
    phone: `139${timestamp.toString().slice(-8)}`,
    password: 'test123456',
    name: name,
    role: role,
    teamId: teamId,
    joinDate: '2025-06-03'
  };

  try {
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const userId = response.data.data.id;
    console.log(`✅ 创建测试用户成功: ${name} (${role}) - ID: ${userId}`);
    return { id: userId, ...userData };
  } catch (error) {
    console.error(`❌ 创建测试用户失败 (${name}):`, error.response?.data?.message || error.message);
    return null;
  }
}

// 测试1: 创建用户时的组长限制
async function testCreateUserLeaderLimit(teamId) {
  console.log('\n🧪 测试1: 创建用户时的组长限制...');
  
  // 先创建一个组长
  const leader1 = await createTestUser('测试组长1', 'leader', teamId);
  if (!leader1) return false;
  
  // 尝试创建第二个组长（应该失败）
  console.log('   尝试创建第二个组长（应该失败）...');
  const leader2 = await createTestUser('测试组长2', 'leader', teamId);
  if (leader2) {
    console.log('❌ 测试失败：应该拒绝创建第二个组长');
    return false;
  } else {
    console.log('✅ 测试成功：正确拒绝了创建第二个组长');
  }
  
  return leader1;
}

// 测试2: 更新用户时的组长限制
async function testUpdateUserLeaderLimit(teamId, existingLeader) {
  console.log('\n🧪 测试2: 更新用户时的组长限制...');
  
  // 创建一个普通销售员
  const sales = await createTestUser('测试销售员', 'sales', teamId);
  if (!sales) return false;
  
  // 尝试将销售员角色改为组长（应该失败）
  console.log('   尝试将销售员角色改为组长（应该失败）...');
  try {
    await axios.put(`${BASE_URL}/users/${sales.id}`, {
      phone: sales.phone,
      name: sales.name,
      role: 'leader',
      teamId: teamId,
      joinDate: sales.joinDate,
      status: 'active'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ 测试失败：应该拒绝将销售员改为组长');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 测试成功：正确拒绝了将销售员改为组长');
      console.log(`   错误信息: ${error.response.data.message}`);
    } else {
      console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
      return false;
    }
  }
  
  return sales;
}

// 测试3: 批量更新团队时的组长限制
async function testBatchUpdateTeamLeaderLimit() {
  console.log('\n🧪 测试3: 批量更新团队时的组长限制...');
  
  // 创建两个团队
  const team1Id = await createTestTeam();
  const team2Id = await createTestTeam();
  if (!team1Id || !team2Id) return false;
  
  // 在团队1创建一个组长
  const leader1 = await createTestUser('团队1组长', 'leader', team1Id);
  if (!leader1) return false;
  
  // 在团队2创建一个组长
  const leader2 = await createTestUser('团队2组长', 'leader', team2Id);
  if (!leader2) return false;
  
  // 尝试将团队2的组长移动到团队1（应该失败）
  console.log('   尝试将团队2的组长移动到团队1（应该失败）...');
  try {
    await axios.post(`${BASE_URL}/users/batch-update-team`, {
      userIds: [leader2.id],
      teamId: team1Id
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ 测试失败：应该拒绝将组长移动到已有组长的团队');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 测试成功：正确拒绝了将组长移动到已有组长的团队');
      console.log(`   错误信息: ${error.response.data.message}`);
    } else {
      console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
      return false;
    }
  }
  
  // 尝试同时将多个组长移动到空团队（应该失败）
  const team3Id = await createTestTeam();
  if (!team3Id) return false;
  
  console.log('   尝试同时将多个组长移动到空团队（应该失败）...');
  try {
    await axios.post(`${BASE_URL}/users/batch-update-team`, {
      userIds: [leader1.id, leader2.id],
      teamId: team3Id
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ 测试失败：应该拒绝同时添加多个组长');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ 测试成功：正确拒绝了同时添加多个组长');
      console.log(`   错误信息: ${error.response.data.message}`);
    } else {
      console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
      return false;
    }
  }
  
  return { team1Id, team2Id, team3Id, leader1, leader2 };
}

// 测试4: 正常情况下的组长操作
async function testNormalLeaderOperations() {
  console.log('\n🧪 测试4: 正常情况下的组长操作...');
  
  // 创建空团队
  const teamId = await createTestTeam();
  if (!teamId) return false;
  
  // 创建组长（应该成功）
  const leader = await createTestUser('正常组长', 'leader', teamId);
  if (!leader) {
    console.log('❌ 测试失败：无法创建组长');
    return false;
  }
  
  // 创建销售员（应该成功）
  const sales = await createTestUser('正常销售员', 'sales', teamId);
  if (!sales) {
    console.log('❌ 测试失败：无法创建销售员');
    return false;
  }
  
  // 将组长移动到另一个空团队（应该成功）
  const newTeamId = await createTestTeam();
  if (!newTeamId) return false;
  
  console.log('   将组长移动到空团队（应该成功）...');
  try {
    await axios.post(`${BASE_URL}/users/batch-update-team`, {
      userIds: [leader.id],
      teamId: newTeamId
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 测试成功：组长成功移动到空团队');
  } catch (error) {
    console.log('❌ 测试失败：组长移动到空团队失败', error.response?.data?.message || error.message);
    return false;
  }
  
  return true;
}

// 清理测试数据
async function cleanupTestData() {
  console.log('\n🧹 清理测试数据...');
  
  try {
    // 获取所有测试团队
    const teamsResponse = await axios.get(`${BASE_URL}/teams?pageSize=100`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const testTeams = teamsResponse.data.data.list.filter(team => 
      team.name.includes('测试组长限制团队') && team.memberCount === 0
    );
    
    if (testTeams.length > 0) {
      const testTeamIds = testTeams.map(team => team.id);
      await axios.delete(`${BASE_URL}/teams/batch/${testTeamIds.join(',')}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ 清理了 ${testTeams.length} 个测试团队`);
    }
    
    // 获取所有测试用户
    const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=100`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const testUsers = usersResponse.data.data.list.filter(user => 
      user.name.includes('测试组长') || user.name.includes('测试销售员') || user.name.includes('正常')
    );
    
    if (testUsers.length > 0) {
      const testUserIds = testUsers.map(user => user.id);
      await axios.delete(`${BASE_URL}/users/batch/${testUserIds.join(',')}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ 清理了 ${testUsers.length} 个测试用户`);
    }
    
    if (testTeams.length === 0 && testUsers.length === 0) {
      console.log('✅ 没有需要清理的测试数据');
    }
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error.response?.data?.message || error.message);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试团队组长身份限制功能...\n');
  
  // 1. 登录
  if (!(await login())) {
    return;
  }
  
  // 2. 创建测试团队
  console.log('\n📝 创建测试团队...');
  const testTeamId = await createTestTeam();
  if (!testTeamId) {
    console.log('❌ 无法创建测试团队，终止测试');
    return;
  }
  
  // 3. 测试创建用户时的组长限制
  const existingLeader = await testCreateUserLeaderLimit(testTeamId);
  if (!existingLeader) {
    console.log('❌ 测试1失败，终止测试');
    return;
  }
  
  // 4. 测试更新用户时的组长限制
  const testResult2 = await testUpdateUserLeaderLimit(testTeamId, existingLeader);
  if (!testResult2) {
    console.log('❌ 测试2失败，终止测试');
    return;
  }
  
  // 5. 测试批量更新团队时的组长限制
  const testResult3 = await testBatchUpdateTeamLeaderLimit();
  if (!testResult3) {
    console.log('❌ 测试3失败，终止测试');
    return;
  }
  
  // 6. 测试正常情况下的组长操作
  const testResult4 = await testNormalLeaderOperations();
  if (!testResult4) {
    console.log('❌ 测试4失败，终止测试');
    return;
  }
  
  // 7. 清理测试数据
  await cleanupTestData();
  
  console.log('\n🎉 团队组长身份限制功能测试完成！');
  console.log('✅ 所有测试都通过了');
}

// 运行测试
runTests().catch(console.error); 
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

// 创建测试小组
async function createTestTeams() {
  const timestamp = Date.now();
  const teams = [
    { name: `测试批量删除小组1_${timestamp}`, level: '4' },
    { name: `测试批量删除小组2_${timestamp}`, level: '10' },
    { name: `测试批量删除小组3_${timestamp}`, level: '15' }
  ];

  const createdTeams = [];

  for (const team of teams) {
    try {
      const response = await axios.post(`${BASE_URL}/teams`, team, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdTeams.push(response.data.data);
      console.log(`✅ 创建小组成功: ${team.name}`);
    } catch (error) {
      console.error(`❌ 创建小组失败: ${team.name}`, error.response?.data?.message || error.message);
    }
  }

  return createdTeams;
}

// 获取小组列表
async function getTeams() {
  try {
    const response = await axios.get(`${BASE_URL}/teams?pageSize=50`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data.data.list;
  } catch (error) {
    console.error('❌ 获取小组列表失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 测试批量删除小组
async function testBatchDeleteTeams(teamIds) {
  try {
    console.log(`\n🧪 测试批量删除小组: [${teamIds.join(', ')}]`);
    
    const response = await axios.delete(`${BASE_URL}/teams/batch/${teamIds.join(',')}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 批量删除成功:', response.data.message);
    console.log('📊 删除结果:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ 批量删除失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试删除有成员的小组
async function testDeleteTeamWithMembers() {
  try {
    console.log('\n🧪 测试删除有成员的小组...');
    
    // 创建一个小组
    const teamResponse = await axios.post(`${BASE_URL}/teams`, {
      name: `有成员的测试小组_${Date.now()}`,
      level: '4'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const teamId = teamResponse.data.data.id;
    console.log(`✅ 创建测试小组成功: ID ${teamId}`);
    
    // 创建一个用户并加入小组
    const userResponse = await axios.post(`${BASE_URL}/users`, {
      phone: '13999999999',
      name: '测试用户',
      role: 'sales',
      teamId: teamId,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 创建测试用户并加入小组成功');
    
    // 尝试批量删除这个有成员的小组
    const deleteResponse = await axios.delete(`${BASE_URL}/teams/batch/${teamId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ 意外成功删除了有成员的小组');
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('还有成员')) {
      console.log('✅ 正确阻止删除有成员的小组:', error.response.data.message);
      return true;
    } else {
      console.error('❌ 测试失败:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试小组批量删除功能...\n');
  
  // 1. 登录
  if (!(await login())) {
    return;
  }
  
  // 2. 创建测试小组
  console.log('\n📝 创建测试小组...');
  const createdTeams = await createTestTeams();
  
  if (createdTeams.length === 0) {
    console.log('❌ 没有创建成功的小组，无法继续测试');
    return;
  }
  
  // 3. 获取小组列表验证创建成功
  console.log('\n📋 验证小组创建成功...');
  const teams = await getTeams();
  const testTeamIds = createdTeams.map(team => team.id);
  console.log(`✅ 当前小组总数: ${teams.length}`);
  
  // 4. 测试批量删除
  if (testTeamIds.length >= 2) {
    const deleteIds = testTeamIds.slice(0, 2); // 删除前两个
    await testBatchDeleteTeams(deleteIds);
    
    // 验证删除结果
    console.log('\n🔍 验证删除结果...');
    const teamsAfterDelete = await getTeams();
    const remainingTestTeams = teamsAfterDelete.filter(team => 
      testTeamIds.includes(team.id)
    );
    console.log(`✅ 删除后剩余测试小组数: ${remainingTestTeams.length}`);
  }
  
  // 5. 测试删除不存在的小组
  console.log('\n🧪 测试删除不存在的小组...');
  try {
    await axios.delete(`${BASE_URL}/teams/batch/99999,99998`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('❌ 意外成功删除了不存在的小组');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ 正确处理删除不存在的小组:', error.response.data.message);
    } else {
      console.error('❌ 意外错误:', error.response?.data?.message || error.message);
    }
  }
  
  // 6. 测试删除有成员的小组
  await testDeleteTeamWithMembers();
  
  // 7. 清理剩余的测试数据
  console.log('\n🧹 清理测试数据...');
  const finalTeams = await getTeams();
  const remainingTestTeams = finalTeams.filter(team => 
    team.name.includes('测试') && team.memberCount === 0
  );
  
  if (remainingTestTeams.length > 0) {
    const cleanupIds = remainingTestTeams.map(team => team.id);
    await testBatchDeleteTeams(cleanupIds);
  }
  
  console.log('\n🎉 批量删除功能测试完成！');
}

// 运行测试
runTests().catch(console.error); 
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
    { name: `测试4人小组_${timestamp}`, level: '4' },
    { name: `测试10人小组_${timestamp}`, level: '10' },
    { name: `测试15人小组_${timestamp}`, level: '15' },
    { name: `测试30人小组_${timestamp}`, level: '30' }
  ];

  const createdTeams = [];

  for (const team of teams) {
    try {
      const response = await axios.post(`${BASE_URL}/teams`, team, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const teamData = { id: response.data.data.id, ...team };
      createdTeams.push(teamData);
      console.log(`✅ 创建小组成功: ${team.name} (${team.level}人) - ID: ${teamData.id}`);
    } catch (error) {
      console.error(`❌ 创建小组失败: ${team.name}`, error.response?.data?.message || error.message);
    }
  }

  return createdTeams;
}

// 测试等级筛选
async function testLevelFilter() {
  console.log('\n🧪 测试等级筛选功能...');
  
  const levels = ['4', '10', '15', '30'];
  
  for (const level of levels) {
    try {
      const response = await axios.get(`${BASE_URL}/teams?level=${level}&pageSize=50`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const teams = response.data.data.list;
      const allMatchLevel = teams.every(team => team.level === level);
      
      if (allMatchLevel) {
        console.log(`✅ ${level}人小组筛选正常: 找到 ${teams.length} 个小组`);
      } else {
        console.log(`❌ ${level}人小组筛选异常: 结果中包含其他等级的小组`);
      }
    } catch (error) {
      console.error(`❌ ${level}人小组筛选失败:`, error.response?.data?.message || error.message);
    }
  }
}

// 测试满员状态筛选
async function testFullStatusFilter() {
  console.log('\n🧪 测试满员状态筛选功能...');
  
  try {
    // 测试已满员筛选
    const fullResponse = await axios.get(`${BASE_URL}/teams?isFull=true&pageSize=50`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const fullTeams = fullResponse.data.data.list;
    const allFull = fullTeams.every(team => team.memberCount >= team.maxMembers);
    
    if (allFull) {
      console.log(`✅ 已满员筛选正常: 找到 ${fullTeams.length} 个满员小组`);
    } else {
      console.log(`❌ 已满员筛选异常: 结果中包含未满员的小组`);
    }
    
    // 测试未满员筛选
    const notFullResponse = await axios.get(`${BASE_URL}/teams?isFull=false&pageSize=50`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const notFullTeams = notFullResponse.data.data.list;
    const allNotFull = notFullTeams.every(team => team.memberCount < team.maxMembers);
    
    if (allNotFull) {
      console.log(`✅ 未满员筛选正常: 找到 ${notFullTeams.length} 个未满员小组`);
    } else {
      console.log(`❌ 未满员筛选异常: 结果中包含满员的小组`);
    }
  } catch (error) {
    console.error('❌ 满员状态筛选失败:', error.response?.data?.message || error.message);
  }
}

// 测试批量调整等级
async function testBatchUpdateLevel(teamIds) {
  console.log('\n🧪 测试批量调整等级功能...');
  
  if (teamIds.length === 0) {
    console.log('❌ 没有可用的测试小组');
    return;
  }
  
  try {
    // 调整为10人小组
    const response = await axios.put(`${BASE_URL}/teams/batch/level`, {
      teamIds: teamIds.slice(0, 2), // 只调整前两个
      level: '10'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ 批量调整等级成功:', response.data.message);
    console.log('📊 调整结果:', response.data.data);
    
    // 验证调整结果
    const verifyResponse = await axios.get(`${BASE_URL}/teams?level=10&pageSize=50`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const updatedTeams = verifyResponse.data.data.list.filter(team => 
      teamIds.slice(0, 2).includes(team.id)
    );
    
    if (updatedTeams.length === 2) {
      console.log('✅ 等级调整验证成功: 小组等级已正确更新');
    } else {
      console.log('❌ 等级调整验证失败: 小组等级未正确更新');
    }
    
  } catch (error) {
    console.error('❌ 批量调整等级失败:', error.response?.data?.message || error.message);
  }
}

// 测试组合筛选
async function testCombinedFilters() {
  console.log('\n🧪 测试组合筛选功能...');
  
  try {
    // 测试等级+满员状态组合筛选
    const response = await axios.get(`${BASE_URL}/teams?level=10&isFull=false&pageSize=50`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const teams = response.data.data.list;
    const validResults = teams.every(team => 
      team.level === '10' && team.memberCount < team.maxMembers
    );
    
    if (validResults) {
      console.log(`✅ 组合筛选正常: 找到 ${teams.length} 个10人未满员小组`);
    } else {
      console.log(`❌ 组合筛选异常: 结果不符合筛选条件`);
    }
  } catch (error) {
    console.error('❌ 组合筛选失败:', error.response?.data?.message || error.message);
  }
}

// 清理测试数据
async function cleanupTestData() {
  console.log('\n🧹 清理测试数据...');
  
  try {
    const response = await axios.get(`${BASE_URL}/teams?pageSize=100`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const testTeams = response.data.data.list.filter(team => 
      team.name.includes('测试') && team.memberCount === 0
    );
    
    if (testTeams.length > 0) {
      const testTeamIds = testTeams.map(team => team.id);
      await axios.delete(`${BASE_URL}/teams/batch/${testTeamIds.join(',')}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ 清理了 ${testTeams.length} 个测试小组`);
    } else {
      console.log('✅ 没有需要清理的测试数据');
    }
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error.response?.data?.message || error.message);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试小组管理新功能...\n');
  
  // 1. 登录
  if (!(await login())) {
    return;
  }
  
  // 2. 创建测试小组
  console.log('\n📝 创建测试小组...');
  const createdTeams = await createTestTeams();
  const teamIds = createdTeams.map(team => team.id);
  
  // 3. 测试等级筛选
  await testLevelFilter();
  
  // 4. 测试满员状态筛选
  await testFullStatusFilter();
  
  // 5. 测试批量调整等级
  await testBatchUpdateLevel(teamIds);
  
  // 6. 测试组合筛选
  await testCombinedFilters();
  
  // 7. 清理测试数据
  await cleanupTestData();
  
  console.log('\n🎉 小组管理新功能测试完成！');
}

// 运行测试
runTests().catch(console.error); 
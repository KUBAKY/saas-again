const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function simpleTest() {
  try {
    console.log('🔐 正在登录...');
    
    // 1. 登录获取token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      phone: '13800000000',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. 获取华中销售组7091的信息（应该是10/10已满）
    const teamsResponse = await axios.get(`${BASE_URL}/teams?pageSize=50`, { headers });
    const teams = teamsResponse.data.data.list;
    const fullTeam = teams.find(team => team.name === '华中销售组7091');
    
    if (!fullTeam) {
      console.log('❌ 没有找到华中销售组7091');
      return;
    }
    
    console.log(`\n📊 团队信息: ${fullTeam.name} - ${fullTeam.memberCount}/${fullTeam.maxMembers}`);
    
    if (fullTeam.memberCount < fullTeam.maxMembers) {
      console.log('⚠️  团队未满，无法测试');
      return;
    }
    
    // 3. 尝试创建新用户并分配到已满团队
    console.log('\n🧪 测试: 创建新用户并分配到已满团队...');
    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        phone: `139${Date.now().toString().slice(-8)}`,
        password: 'test123456',
        name: '测试用户限制',
        role: 'sales',
        teamId: fullTeam.id,
        joinDate: '2025-06-03'
      }, { headers });
      
      console.log('❌ 测试失败：应该拒绝创建用户并分配到已满团队');
      console.log('响应:', response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ 测试成功：正确拒绝了创建用户并分配到已满团队');
        console.log(`   错误信息: ${error.response.data.message}`);
      } else {
        console.log('❌ 测试失败：返回了意外的错误');
        console.log('错误状态:', error.response?.status);
        console.log('错误信息:', error.response?.data);
      }
    }
    
    // 4. 获取一个未分配团队的用户
    const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=50`, { headers });
    const unassignedUsers = usersResponse.data.data.list.filter(user => !user.teamName && !user.teamId);
    
    if (unassignedUsers.length === 0) {
      console.log('\n⚠️  没有找到未分配团队的用户');
      return;
    }
    
    const testUser = unassignedUsers[0];
    console.log(`\n👤 选择测试用户: ${testUser.name} (ID: ${testUser.id})`);
    
    // 5. 尝试通过更新用户API添加到已满团队
    console.log('\n🧪 测试: 通过更新用户API添加到已满团队...');
    try {
      const response = await axios.put(`${BASE_URL}/users/${testUser.id}`, {
        phone: testUser.phone,
        name: testUser.name,
        role: testUser.role,
        teamId: fullTeam.id,
        joinDate: testUser.joinDate,
        status: testUser.status || 'active'
      }, { headers });
      
      console.log('❌ 测试失败：应该拒绝添加用户到已满团队');
      console.log('响应:', response.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ 测试成功：正确拒绝了添加用户到已满团队');
        console.log(`   错误信息: ${error.response.data.message}`);
      } else {
        console.log('❌ 测试失败：返回了意外的错误');
        console.log('错误状态:', error.response?.status);
        console.log('错误信息:', error.response?.data);
        console.log('完整错误:', error.message);
      }
    }
    
    console.log('\n🎉 简单测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

simpleTest(); 
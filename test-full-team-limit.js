const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testFullTeamLimit() {
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
    
    // 2. 获取已满的团队
    console.log('\n📋 获取团队列表...');
    const teamsResponse = await axios.get(`${BASE_URL}/teams?pageSize=50`, { headers });
    const teams = teamsResponse.data.data.list;
    
    const fullTeams = teams.filter(team => team.memberCount >= team.maxMembers);
    console.log(`找到 ${fullTeams.length} 个已满的团队:`);
    fullTeams.forEach(team => {
      console.log(`- ${team.name}: ${team.memberCount}/${team.maxMembers}`);
    });
    
    if (fullTeams.length === 0) {
      console.log('⚠️  没有找到已满的团队，无法测试');
      return;
    }
    
    const testTeam = fullTeams[0];
    console.log(`\n🎯 使用团队 "${testTeam.name}" 进行测试`);
    
    // 3. 获取未分配团队的用户
    const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=50`, { headers });
    const unassignedUsers = usersResponse.data.data.list.filter(user => !user.teamName && !user.teamId);
    
    if (unassignedUsers.length === 0) {
      console.log('⚠️  没有找到未分配团队的用户，无法测试');
      return;
    }
    
    const testUser = unassignedUsers[0];
    console.log(`选择测试用户: ${testUser.name} (${testUser.role})`);
    
    // 4. 测试1: 尝试通过更新用户API添加到已满团队
    console.log('\n🧪 测试1: 尝试通过更新用户API添加到已满团队（应该失败）...');
    try {
      await axios.put(`${BASE_URL}/users/${testUser.id}`, {
        phone: testUser.phone,
        name: testUser.name,
        role: testUser.role,
        teamId: testTeam.id,
        joinDate: testUser.joinDate,
        status: testUser.status || 'active'
      }, { headers });
      
      console.log('❌ 测试失败：应该拒绝添加用户到已满团队');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('已达到最大人数限制')) {
        console.log('✅ 测试成功：正确拒绝了添加用户到已满团队');
        console.log(`   错误信息: ${error.response.data.message}`);
      } else {
        console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
      }
    }
    
    // 5. 测试2: 尝试通过批量更新API添加到已满团队
    console.log('\n🧪 测试2: 尝试通过批量更新API添加到已满团队（应该失败）...');
    try {
      await axios.post(`${BASE_URL}/users/batch-update-team`, {
        userIds: [testUser.id],
        teamId: testTeam.id
      }, { headers });
      
      console.log('❌ 测试失败：应该拒绝批量添加用户到已满团队');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('无法添加')) {
        console.log('✅ 测试成功：正确拒绝了批量添加用户到已满团队');
        console.log(`   错误信息: ${error.response.data.message}`);
      } else {
        console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
      }
    }
    
    // 6. 测试3: 尝试创建新用户并分配到已满团队
    console.log('\n🧪 测试3: 尝试创建新用户并分配到已满团队（应该失败）...');
    try {
      await axios.post(`${BASE_URL}/users`, {
        phone: `139${Date.now().toString().slice(-8)}`,
        password: 'test123456',
        name: '测试用户',
        role: 'sales',
        teamId: testTeam.id,
        joinDate: '2025-06-03'
      }, { headers });
      
      console.log('❌ 测试失败：应该拒绝创建用户并分配到已满团队');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('已达到最大人数限制')) {
        console.log('✅ 测试成功：正确拒绝了创建用户并分配到已满团队');
        console.log(`   错误信息: ${error.response.data.message}`);
      } else {
        console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
      }
    }
    
    // 7. 测试4: 尝试批量添加多个用户到已满团队
    if (unassignedUsers.length >= 2) {
      console.log('\n🧪 测试4: 尝试批量添加多个用户到已满团队（应该失败）...');
      const multipleUserIds = unassignedUsers.slice(0, 2).map(user => user.id);
      
      try {
        await axios.post(`${BASE_URL}/users/batch-update-team`, {
          userIds: multipleUserIds,
          teamId: testTeam.id
        }, { headers });
        
        console.log('❌ 测试失败：应该拒绝批量添加多个用户到已满团队');
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('无法添加')) {
          console.log('✅ 测试成功：正确拒绝了批量添加多个用户到已满团队');
          console.log(`   错误信息: ${error.response.data.message}`);
        } else {
          console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
        }
      }
    }
    
    console.log('\n🎉 已满团队人数限制功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testFullTeamLimit(); 
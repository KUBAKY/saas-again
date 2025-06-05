const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function finalVerification() {
  try {
    console.log('🎯 团队人数限制功能最终验证\n');
    
    // 1. 登录获取token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      phone: '13800000000',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. 获取团队状态
    console.log('📊 当前团队状态:');
    const teamsResponse = await axios.get(`${BASE_URL}/teams?pageSize=50`, { headers });
    const teams = teamsResponse.data.data.list;
    
    const fullTeams = teams.filter(team => team.memberCount >= team.maxMembers);
    const availableTeams = teams.filter(team => team.memberCount < team.maxMembers);
    
    console.log(`- 已满团队: ${fullTeams.length}个`);
    fullTeams.forEach(team => {
      console.log(`  * ${team.name}: ${team.memberCount}/${team.maxMembers}`);
    });
    
    console.log(`- 有空位团队: ${availableTeams.length}个`);
    
    // 3. 获取未分配团队的用户
    const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=100`, { headers });
    const unassignedUsers = usersResponse.data.data.list.filter(user => !user.teamName && !user.teamId);
    console.log(`- 未分配团队用户: ${unassignedUsers.length}人\n`);
    
    // 4. 测试功能
    let testsPassed = 0;
    let totalTests = 0;
    
    if (fullTeams.length > 0 && unassignedUsers.length > 0) {
      const testTeam = fullTeams[0];
      const testUser = unassignedUsers[0];
      
      console.log('🧪 功能测试:');
      
      // 测试1: 创建用户到已满团队
      totalTests++;
      console.log('\n1. 测试创建用户到已满团队...');
      try {
        await axios.post(`${BASE_URL}/users`, {
          phone: `139${Date.now().toString().slice(-8)}`,
          password: 'test123456',
          name: '测试用户',
          role: 'sales',
          teamId: testTeam.id,
          joinDate: '2025-06-03'
        }, { headers });
        console.log('   ❌ 失败：应该拒绝创建');
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('已达到最大人数限制')) {
          console.log('   ✅ 成功：正确拒绝创建');
          testsPassed++;
        } else {
          console.log('   ❌ 失败：错误类型不正确');
        }
      }
      
      // 测试2: 更新用户到已满团队
      totalTests++;
      console.log('\n2. 测试更新用户到已满团队...');
      try {
        await axios.put(`${BASE_URL}/users/${testUser.id}`, {
          phone: testUser.phone,
          name: testUser.name,
          role: testUser.role,
          teamId: testTeam.id,
          joinDate: testUser.joinDate || '2025-06-03',
          status: testUser.status || 'active'
        }, { headers });
        console.log('   ❌ 失败：应该拒绝更新');
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('已达到最大人数限制')) {
          console.log('   ✅ 成功：正确拒绝更新');
          testsPassed++;
        } else {
          console.log('   ❌ 失败：错误类型不正确');
        }
      }
      
      // 测试3: 批量更新用户到已满团队
      totalTests++;
      console.log('\n3. 测试批量更新用户到已满团队...');
      try {
        await axios.post(`${BASE_URL}/users/batch-update-team`, {
          userIds: [testUser.id],
          teamId: testTeam.id
        }, { headers });
        console.log('   ❌ 失败：应该拒绝批量更新');
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('无法添加')) {
          console.log('   ✅ 成功：正确拒绝批量更新');
          testsPassed++;
        } else {
          console.log('   ❌ 失败：错误类型不正确');
        }
      }
    }
    
    if (availableTeams.length > 0 && unassignedUsers.length > 0) {
      const testTeam = availableTeams[0];
      const testUser = unassignedUsers[0];
      
      // 测试4: 添加用户到有空位的团队
      totalTests++;
      console.log('\n4. 测试添加用户到有空位的团队...');
      console.log(`   使用团队: ${testTeam.name} (${testTeam.memberCount}/${testTeam.maxMembers})`);
      console.log(`   使用用户: ${testUser.name} (ID: ${testUser.id})`);
      try {
        await axios.put(`${BASE_URL}/users/${testUser.id}`, {
          phone: testUser.phone,
          name: testUser.name,
          role: testUser.role,
          teamId: testTeam.id,
          joinDate: testUser.joinDate || '2025-06-03',
          status: testUser.status || 'active'
        }, { headers });
        console.log('   ✅ 成功：正确允许添加到有空位的团队');
        testsPassed++;
        
        // 恢复状态
        await axios.put(`${BASE_URL}/users/${testUser.id}`, {
          phone: testUser.phone,
          name: testUser.name,
          role: testUser.role,
          teamId: null,
          joinDate: testUser.joinDate || '2025-06-03',
          status: testUser.status || 'active'
        }, { headers });
      } catch (error) {
        console.log('   ❌ 失败：应该允许添加到有空位的团队');
        console.log('   错误:', error.response?.data);
        console.log('   用户数据:', {
          phone: testUser.phone,
          name: testUser.name,
          role: testUser.role,
          teamId: testTeam.id,
          joinDate: testUser.joinDate || '2025-06-03',
          status: testUser.status || 'active'
        });
      }
    }
    
    // 5. 总结
    console.log('\n📋 验证结果:');
    console.log(`- 通过测试: ${testsPassed}/${totalTests}`);
    console.log(`- 成功率: ${totalTests > 0 ? Math.round(testsPassed / totalTests * 100) : 0}%`);
    
    if (testsPassed === totalTests) {
      console.log('\n🎉 所有团队人数限制功能验证通过！');
      console.log('\n✅ 功能确认:');
      console.log('  - 创建用户时检查团队人数限制');
      console.log('  - 更新用户团队时检查人数限制');
      console.log('  - 批量更新用户团队时检查人数限制');
      console.log('  - 允许添加到有空位的团队');
      console.log('  - 正确的错误信息提示');
    } else {
      console.log('\n⚠️  部分功能验证失败，请检查实现');
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error.response?.data || error.message);
  }
}

finalVerification(); 
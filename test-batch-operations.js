const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testBatchOperations() {
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
    
    // 2. 获取用户列表
    console.log('\n📋 获取用户列表...');
    const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=10`, { headers });
    const users = usersResponse.data.data.list;
    
    console.log(`找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, 姓名: ${user.name}, 角色: ${user.role}, 状态: ${user.status}, 团队: ${user.teamName || '无'}`);
    });
    
    // 选择一些测试用户（排除管理员）
    const testUsers = users.filter(user => user.role !== 'manager').slice(0, 3);
    const testUserIds = testUsers.map(user => user.id);
    
    if (testUserIds.length === 0) {
      console.log('❌ 没有找到可测试的用户');
      return;
    }
    
    console.log(`\n🎯 选择测试用户: ${testUserIds.join(', ')}`);
    
    // 3. 测试批量更新状态
    console.log('\n🔄 测试批量更新状态...');
    try {
      const statusResponse = await axios.post(`${BASE_URL}/users/batch-update-status`, {
        userIds: testUserIds,
        status: 'inactive'
      }, { headers });
      
      console.log('✅ 批量更新状态成功:', statusResponse.data.message);
      console.log(`   成功: ${statusResponse.data.data.successCount}, 失败: ${statusResponse.data.data.failedCount}`);
      
      if (statusResponse.data.data.failedUsers.length > 0) {
        console.log('   失败用户:', statusResponse.data.data.failedUsers);
      }
    } catch (error) {
      console.log('❌ 批量更新状态失败:', error.response?.data?.message || error.message);
    }
    
    // 4. 测试批量更新团队
    console.log('\n👥 测试批量更新团队...');
    try {
      // 先获取团队列表
      const teamsResponse = await axios.get(`${BASE_URL}/teams`, { headers });
      const teams = teamsResponse.data.data.list;
      
      if (teams.length > 0) {
        const targetTeamId = teams[0].id;
        console.log(`   目标团队: ${teams[0].name} (ID: ${targetTeamId})`);
        
        const teamResponse = await axios.post(`${BASE_URL}/users/batch-update-team`, {
          userIds: testUserIds,
          teamId: targetTeamId
        }, { headers });
        
        console.log('✅ 批量更新团队成功:', teamResponse.data.message);
        console.log(`   成功: ${teamResponse.data.data.successCount}, 失败: ${teamResponse.data.data.failedCount}`);
        
        if (teamResponse.data.data.failedUsers.length > 0) {
          console.log('   失败用户:', teamResponse.data.data.failedUsers);
        }
      } else {
        console.log('❌ 没有找到可用的团队');
      }
    } catch (error) {
      console.log('❌ 批量更新团队失败:', error.response?.data?.message || error.message);
    }
    
    // 5. 测试批量删除（选择没有客户的用户）
    console.log('\n🗑️  测试批量删除...');
    try {
      // 找一个没有客户的用户来测试删除
      const usersWithoutCustomers = [];
      
      for (const userId of testUserIds) {
        try {
          const customersResponse = await axios.get(`${BASE_URL}/customers?ownerId=${userId}&pageSize=1`, { headers });
          if (customersResponse.data.data.list.length === 0) {
            usersWithoutCustomers.push(userId);
          }
        } catch (error) {
          // 忽略错误，继续检查下一个用户
        }
      }
      
      if (usersWithoutCustomers.length > 0) {
        const deleteUserIds = usersWithoutCustomers.slice(0, 1); // 只删除一个用户
        console.log(`   尝试删除用户: ${deleteUserIds.join(', ')}`);
        
        const deleteResponse = await axios.post(`${BASE_URL}/users/batch-delete`, {
          userIds: deleteUserIds
        }, { headers });
        
        console.log('✅ 批量删除测试完成:', deleteResponse.data.message);
        console.log(`   成功: ${deleteResponse.data.data.successCount}, 失败: ${deleteResponse.data.data.failedCount}`);
        
        if (deleteResponse.data.data.failedUsers.length > 0) {
          console.log('   失败用户:', deleteResponse.data.data.failedUsers);
        }
      } else {
        console.log('⚠️  所有测试用户都有关联客户，跳过删除测试');
      }
    } catch (error) {
      console.log('❌ 批量删除失败:', error.response?.data?.message || error.message);
    }
    
    // 6. 恢复用户状态
    console.log('\n🔄 恢复用户状态...');
    try {
      const restoreResponse = await axios.post(`${BASE_URL}/users/batch-update-status`, {
        userIds: testUserIds,
        status: 'active'
      }, { headers });
      
      console.log('✅ 恢复用户状态成功:', restoreResponse.data.message);
    } catch (error) {
      console.log('❌ 恢复用户状态失败:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 批量操作功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testBatchOperations(); 
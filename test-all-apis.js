const axios = require('axios');

const API_URL = 'http://localhost:3002/api'; // 通过前端代理访问

async function testAllAPIs() {
  console.log('🚀 开始测试所有API功能...');
  
  try {
    // 1. 登录
    console.log('\n1. 测试登录...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      phone: '13800000000',
      password: 'admin123'
    });
    
    if (loginResponse.data.code !== 200) {
      throw new Error('登录失败');
    }
    
    console.log('✅ 登录成功');
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. 测试客户管理API
    console.log('\n2. 测试客户管理API...');
    const customersResponse = await axios.get(`${API_URL}/customers?page=1&pageSize=5`, { headers });
    
    if (customersResponse.data.code === 200) {
      console.log(`✅ 客户API正常，共 ${customersResponse.data.data.pagination.total} 个客户`);
      console.log(`   前5个客户:`, customersResponse.data.data.list.map(c => `${c.name}(${c.phone})`).join(', '));
    } else {
      console.log('❌ 客户API异常');
    }

    // 3. 测试用户管理API
    console.log('\n3. 测试用户管理API...');
    const usersResponse = await axios.get(`${API_URL}/users?page=1&pageSize=5`, { headers });
    
    if (usersResponse.data.code === 200) {
      console.log(`✅ 用户API正常，共 ${usersResponse.data.data.pagination.total} 个用户`);
      console.log(`   前5个用户:`, usersResponse.data.data.list.map(u => `${u.name}(${u.role})`).join(', '));
    } else {
      console.log('❌ 用户API异常');
    }

    // 4. 测试小组管理API
    console.log('\n4. 测试小组管理API...');
    const teamsResponse = await axios.get(`${API_URL}/teams?page=1&pageSize=5`, { headers });
    
    if (teamsResponse.data.code === 200) {
      console.log(`✅ 小组API正常，共 ${teamsResponse.data.data.pagination.total} 个小组`);
      console.log(`   前5个小组:`, teamsResponse.data.data.list.map(t => `${t.name}(${t.memberCount}人)`).join(', '));
      
      // 5. 测试小组成员API
      const firstTeam = teamsResponse.data.data.list[0];
      if (firstTeam && firstTeam.memberCount > 0) {
        console.log('\n5. 测试小组成员API...');
        const membersResponse = await axios.get(`${API_URL}/teams/${firstTeam.id}/members`, { headers });
        
        if (membersResponse.data.code === 200) {
          console.log(`✅ 小组成员API正常，小组"${firstTeam.name}"有 ${membersResponse.data.data.length} 个成员`);
          console.log(`   成员列表:`, membersResponse.data.data.map(m => `${m.name}(${m.phone})`).join(', '));
        } else {
          console.log('❌ 小组成员API异常');
        }
      } else {
        console.log('\n5. 跳过小组成员测试（没有有成员的小组）');
      }
    } else {
      console.log('❌ 小组API异常');
    }

    console.log('\n🎉 所有API测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testAllAPIs(); 
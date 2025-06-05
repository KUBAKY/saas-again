const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3002';
const API_URL = 'http://localhost:3002/api'; // 通过前端代理访问

async function testFrontendLogin() {
  console.log('测试前端登录功能...');
  
  try {
    // 1. 测试前端是否可访问
    console.log('\n1. 检查前端服务...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('前端服务正常运行');

    // 2. 测试登录API（通过前端代理）
    console.log('\n2. 测试登录API...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      phone: '13800000000',
      password: 'admin123'
    });
    
    if (loginResponse.data.code === 200) {
      console.log('登录成功！');
      console.log('用户信息:', loginResponse.data.data.user);
      
      const token = loginResponse.data.data.token;
      
      // 3. 测试需要认证的API
      console.log('\n3. 测试小组管理API...');
      const teamsResponse = await axios.get(`${API_URL}/teams?page=1&pageSize=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (teamsResponse.data.code === 200) {
        console.log('小组API正常，返回数据:', teamsResponse.data.data.list.length, '个小组');
      }
      
      // 4. 测试用户管理API
      console.log('\n4. 测试用户管理API...');
      const usersResponse = await axios.get(`${API_URL}/users?page=1&pageSize=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (usersResponse.data.code === 200) {
        console.log('用户API正常，返回数据:', usersResponse.data.data.list.length, '个用户');
      }
      
    } else {
      console.log('登录失败:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testFrontendLogin(); 
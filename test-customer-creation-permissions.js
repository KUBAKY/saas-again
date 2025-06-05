const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// 测试用户凭据
const testUsers = {
  admin: { phone: '13800000000', password: '123456' },
  leader: { phone: '13800000002', password: '123456' },
  sales: { phone: '13800000003', password: '123456' }
};

// 登录函数
async function login(userType) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, testUsers[userType]);
    if (response.data.code === 200) {
      return response.data.data.token;
    }
    throw new Error(`登录失败: ${response.data.message}`);
  } catch (error) {
    throw new Error(`登录失败: ${error.message}`);
  }
}

// 测试创建客户
async function testCreateCustomer(token, userType) {
  const customerData = {
    starLevel: 3,
    name: `测试客户-${userType}-${Date.now()}`,
    phone: `139${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    gender: 'male',
    age: 30,
    qualification: '测试客户资质',
    requirements: '测试客户需求',
    ownerId: 3,
    teamId: 1
  };

  try {
    const response = await axios.post(`${API_BASE}/customers`, customerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 开始测试客户创建权限控制\n');

  const userTypes = ['admin', 'leader', 'sales'];
  
  for (const userType of userTypes) {
    console.log(`📋 测试 ${userType} 用户创建客户权限:`);
    
    try {
      // 登录
      const token = await login(userType);
      console.log(`✅ ${userType} 登录成功`);
      
      // 测试创建客户
      const result = await testCreateCustomer(token, userType);
      
      if (userType === 'admin') {
        // 管理员应该能够创建客户
        if (result.success) {
          console.log(`✅ ${userType} 成功创建客户 (符合预期)`);
        } else {
          console.log(`❌ ${userType} 创建客户失败 (不符合预期): ${result.error.message || result.error}`);
        }
      } else {
        // 组长和销售员应该无法创建客户
        if (!result.success && result.status === 403) {
          console.log(`✅ ${userType} 被正确拒绝创建客户 (符合预期): ${result.error.message}`);
        } else if (result.success) {
          console.log(`❌ ${userType} 意外成功创建客户 (不符合预期)`);
        } else {
          console.log(`⚠️  ${userType} 创建客户失败，但错误码不是403: ${result.error.message || result.error}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${userType} 测试失败: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🏁 测试完成');
}

// 运行测试
runTests().catch(console.error); 
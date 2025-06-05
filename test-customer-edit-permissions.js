const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户凭据
const testUsers = {
  admin: { phone: '13800000001', password: '123456' },
  manager: { phone: '13800000002', password: '123456' },
  leader: { phone: '13800000003', password: '123456' },
  sales: { phone: '13800000004', password: '123456' }
};

// 登录函数
async function login(userType) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUsers[userType]);
    return response.data.data.token;
  } catch (error) {
    console.error(`${userType} 登录失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 测试客户编辑权限
async function testCustomerEditPermission(userType, token) {
  try {
    console.log(`\n=== 测试 ${userType} 编辑客户权限 ===`);
    
    // 假设客户ID为1，尝试更新客户信息
    const updateData = {
      name: '测试客户更新',
      phone: '13900000999',
      starLevel: 4
    };
    
    const response = await axios.put(`${BASE_URL}/customers/1`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ ${userType} 成功编辑客户:`, response.data.message);
    return true;
  } catch (error) {
    if (error.response?.status === 403) {
      console.log(`❌ ${userType} 被正确拒绝编辑客户:`, error.response.data.message);
      return false;
    } else {
      console.log(`⚠️ ${userType} 编辑客户时发生其他错误:`, error.response?.data?.message || error.message);
      return false;
    }
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试客户编辑权限控制...\n');
  
  const results = {};
  
  for (const userType of ['admin', 'manager', 'leader', 'sales']) {
    const token = await login(userType);
    if (token) {
      results[userType] = await testCustomerEditPermission(userType, token);
    } else {
      console.log(`❌ ${userType} 登录失败，跳过测试`);
      results[userType] = null;
    }
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log('==================');
  
  // 期望结果
  const expectedResults = {
    admin: true,    // 管理员应该可以编辑
    manager: true,  // 总经理应该可以编辑
    leader: false,  // 组长应该被拒绝
    sales: false    // 销售员应该被拒绝
  };
  
  let allTestsPassed = true;
  
  for (const [userType, result] of Object.entries(results)) {
    const expected = expectedResults[userType];
    const status = result === expected ? '✅ 通过' : '❌ 失败';
    
    if (result !== expected) {
      allTestsPassed = false;
    }
    
    console.log(`${userType.padEnd(8)}: ${status} (期望: ${expected ? '可编辑' : '被拒绝'}, 实际: ${result === null ? '登录失败' : result ? '可编辑' : '被拒绝'})`);
  }
  
  console.log('\n🎯 权限控制测试', allTestsPassed ? '✅ 全部通过' : '❌ 存在问题');
  
  if (allTestsPassed) {
    console.log('\n✨ 客户编辑权限控制已正确实现：');
    console.log('   - 只有管理员和总经理可以编辑客户');
    console.log('   - 组长和销售员被正确拒绝');
  }
}

// 运行测试
runTests().catch(console.error); 
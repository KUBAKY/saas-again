const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户凭据
const testUsers = {
  admin: { phone: '13800000000', password: '123456' },
  manager: { phone: '13800000001', password: '123456' },
  leader: { phone: '13800000002', password: '123456' },
  sales: { phone: '13800000003', password: '123456' }
};

let tokens = {};

// 登录获取token
async function login(role) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUsers[role]);
    tokens[role] = response.data.data.token;
    console.log(`✅ ${role} 登录成功`);
    return response.data.data.user;
  } catch (error) {
    console.log(`❌ ${role} 登录失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 测试用户列表访问权限
async function testUserListAccess(role) {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${tokens[role]}` }
    });
    console.log(`✅ ${role} 可以访问用户列表`);
    return response.data.data;
  } catch (error) {
    console.log(`❌ ${role} 无法访问用户列表:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 测试创建用户权限
async function testCreateUser(role, targetRole) {
  try {
    const userData = {
      phone: `138${Math.random().toString().substr(2, 8)}`,
      name: `测试用户${Date.now()}`,
      role: targetRole,
      joinDate: '2024-01-01'
    };
    
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${tokens[role]}` }
    });
    console.log(`✅ ${role} 可以创建 ${targetRole} 用户`);
    return response.data.data;
  } catch (error) {
    console.log(`❌ ${role} 无法创建 ${targetRole} 用户:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 测试修改用户权限
async function testUpdateUser(role, targetUserId, targetRole) {
  try {
    const updateData = {
      name: `更新的用户名${Date.now()}`
    };
    
    const response = await axios.put(`${BASE_URL}/users/${targetUserId}`, updateData, {
      headers: { Authorization: `Bearer ${tokens[role]}` }
    });
    console.log(`✅ ${role} 可以修改 ${targetRole} 用户`);
    return true;
  } catch (error) {
    console.log(`❌ ${role} 无法修改 ${targetRole} 用户:`, error.response?.data?.message || error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试角色权限系统...\n');

  // 1. 登录所有角色
  console.log('1. 测试登录功能');
  const adminUser = await login('admin');
  const managerUser = await login('manager');
  const leaderUser = await login('leader');
  const salesUser = await login('sales');
  console.log('');

  // 2. 测试用户列表访问权限
  console.log('2. 测试用户列表访问权限');
  await testUserListAccess('admin');
  await testUserListAccess('manager');
  await testUserListAccess('leader');
  await testUserListAccess('sales');
  console.log('');

  // 3. 测试创建用户权限
  console.log('3. 测试创建用户权限');
  
  // 系统管理员测试
  console.log('3.1 系统管理员创建用户测试:');
  await testCreateUser('admin', 'admin');
  await testCreateUser('admin', 'manager');
  await testCreateUser('admin', 'leader');
  await testCreateUser('admin', 'sales');
  
  // 总经理测试
  console.log('3.2 总经理创建用户测试:');
  await testCreateUser('manager', 'admin'); // 应该失败
  await testCreateUser('manager', 'manager');
  await testCreateUser('manager', 'leader');
  await testCreateUser('manager', 'sales');
  
  // 组长测试
  console.log('3.3 组长创建用户测试:');
  await testCreateUser('leader', 'sales'); // 应该失败
  
  // 销售员测试
  console.log('3.4 销售员创建用户测试:');
  await testCreateUser('sales', 'sales'); // 应该失败
  console.log('');

  // 4. 测试修改用户权限
  console.log('4. 测试修改用户权限');
  if (adminUser && managerUser) {
    console.log('4.1 总经理尝试修改系统管理员:');
    await testUpdateUser('manager', adminUser.id, 'admin'); // 应该失败
    
    console.log('4.2 系统管理员修改总经理:');
    await testUpdateUser('admin', managerUser.id, 'manager'); // 应该成功
  }
  console.log('');

  console.log('✨ 权限测试完成！');
}

// 运行测试
runTests().catch(console.error); 
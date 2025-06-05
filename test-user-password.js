const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户登录
async function testLogin(phone, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      phone,
      password
    });
    console.log(`✅ 登录成功: ${phone} / ${password}`);
    return response.data.data.token;
  } catch (error) {
    console.error(`❌ 登录失败: ${phone} / ${password} - ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 创建测试用户
async function createTestUser(authToken, userData) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ 创建用户成功: ${userData.name} (${userData.phone})`);
    return response.data.data.id;
  } catch (error) {
    console.error(`❌ 创建用户失败: ${userData.name} - ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// 测试修改密码
async function testChangePassword(authToken, oldPassword, newPassword) {
  try {
    await axios.put(`${BASE_URL}/auth/password`, {
      oldPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ 修改密码成功: ${oldPassword} -> ${newPassword}`);
    return true;
  } catch (error) {
    console.error(`❌ 修改密码失败: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 开始测试新增用户初始密码功能...\n');

  // 1. 使用管理员账号登录
  console.log('1. 管理员登录测试');
  const adminToken = await testLogin('13800000000', 'password123');
  if (!adminToken) {
    console.log('❌ 管理员登录失败，无法继续测试');
    return;
  }
  console.log('');

  // 2. 创建测试用户（不提供密码，应该自动设置为手机号后6位）
  console.log('2. 创建测试用户（自动密码）');
  const testPhone = '13912345678';
  const expectedPassword = testPhone.slice(-6); // 345678
  
  const testUserData = {
    name: '测试用户',
    phone: testPhone,
    role: 'sales',
    joinDate: '2025-01-01'
    // 注意：没有提供password字段
  };

  const userId = await createTestUser(adminToken, testUserData);
  if (!userId) {
    console.log('❌ 创建用户失败，无法继续测试');
    return;
  }
  console.log('');

  // 3. 使用自动生成的密码登录
  console.log('3. 使用自动生成的密码登录测试');
  console.log(`   手机号: ${testPhone}`);
  console.log(`   预期密码: ${expectedPassword}`);
  
  const userToken = await testLogin(testPhone, expectedPassword);
  if (!userToken) {
    console.log('❌ 使用自动密码登录失败');
    return;
  }
  console.log('');

  // 4. 测试修改密码功能
  console.log('4. 修改密码测试');
  const newPassword = 'newpass123';
  const changeSuccess = await testChangePassword(userToken, expectedPassword, newPassword);
  if (!changeSuccess) {
    console.log('❌ 修改密码失败');
    return;
  }
  console.log('');

  // 5. 使用新密码登录
  console.log('5. 使用新密码登录测试');
  const newToken = await testLogin(testPhone, newPassword);
  if (!newToken) {
    console.log('❌ 使用新密码登录失败');
    return;
  }
  console.log('');

  // 6. 清理测试数据
  console.log('6. 清理测试数据');
  try {
    await axios.delete(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ 测试用户删除成功');
  } catch (error) {
    console.error(`❌ 删除测试用户失败: ${error.response?.data?.message || error.message}`);
  }

  console.log('\n🎉 所有测试完成！新增用户初始密码功能正常工作');
}

// 运行测试
runTests().catch(console.error); 
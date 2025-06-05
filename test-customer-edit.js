const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testCustomerEdit() {
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
    
    // 2. 获取客户详情
    console.log('\n📋 获取客户详情...');
    const customerResponse = await axios.get(`${BASE_URL}/customers/1`, { headers });
    const customer = customerResponse.data.data;
    
    console.log('客户信息:');
    console.log(`- ID: ${customer.id}`);
    console.log(`- 姓名: ${customer.name}`);
    console.log(`- 电话: ${customer.phone}`);
    console.log(`- 星级: ${customer.starLevel}`);
    console.log(`- 性别: ${customer.gender}`);
    console.log(`- 年龄: ${customer.age}`);
    console.log(`- 资质: ${customer.qualification}`);
    console.log(`- 归属销售员ID: ${customer.ownerId}`);
    console.log(`- 归属团队ID: ${customer.teamId}`);
    
    // 3. 测试编辑客户
    console.log('\n✏️ 测试编辑客户...');
    const updateData = {
      starLevel: customer.starLevel,
      name: customer.name + '(已编辑)',
      phone: customer.phone,
      gender: customer.gender,
      age: customer.age + 1,
      qualification: customer.qualification + ' - 测试编辑',
      ownerId: customer.ownerId,
      teamId: customer.teamId
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/customers/1`, updateData, { headers });
    console.log('✅ 客户更新成功:', updateResponse.data.message);
    
    // 4. 验证更新结果
    console.log('\n🔍 验证更新结果...');
    const updatedCustomerResponse = await axios.get(`${BASE_URL}/customers/1`, { headers });
    const updatedCustomer = updatedCustomerResponse.data.data;
    
    console.log('更新后的客户信息:');
    console.log(`- 姓名: ${updatedCustomer.name}`);
    console.log(`- 年龄: ${updatedCustomer.age}`);
    console.log(`- 资质: ${updatedCustomer.qualification}`);
    
    // 5. 恢复原始数据
    console.log('\n🔄 恢复原始数据...');
    const restoreData = {
      starLevel: customer.starLevel,
      name: customer.name,
      phone: customer.phone,
      gender: customer.gender,
      age: customer.age,
      qualification: customer.qualification,
      ownerId: customer.ownerId,
      teamId: customer.teamId
    };
    
    await axios.put(`${BASE_URL}/customers/1`, restoreData, { headers });
    console.log('✅ 数据已恢复');
    
    console.log('\n🎉 客户编辑功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testCustomerEdit(); 
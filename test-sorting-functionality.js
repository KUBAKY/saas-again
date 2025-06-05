const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户凭据
const testUser = {
  phone: '13800000001',
  password: '123456'
};

let authToken = null;

// 登录获取token
async function login() {
  try {
    console.log('🔐 正在登录...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = response.data.data.token;
    console.log('✅ 登录成功');
    return authToken;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 测试客户列表API
async function testCustomerList(sortField = null, sortOrder = null) {
  try {
    const params = new URLSearchParams({
      page: '1',
      pageSize: '10'
    });
    
    if (sortField && sortOrder) {
      params.append('sortField', sortField);
      params.append('sortOrder', sortOrder);
    }
    
    console.log(`\n📋 测试客户列表 - 排序: ${sortField || '无'} ${sortOrder || ''}`);
    console.log(`🔗 请求URL: ${BASE_URL}/customers?${params.toString()}`);
    
    const response = await axios.get(`${BASE_URL}/customers?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.code === 200) {
      const customers = response.data.data.list;
      console.log(`✅ 获取客户列表成功，共 ${customers.length} 条记录`);
      
      // 显示前5个客户的星级信息
      console.log('\n📊 客户星级信息:');
      customers.slice(0, 5).forEach((customer, index) => {
        const stars = '★'.repeat(customer.starLevel) + '☆'.repeat(5 - customer.starLevel);
        console.log(`${index + 1}. ${customer.name} - ${stars} (${customer.starLevel}星) - ${customer.lastFollowTime || '无跟进'}`);
      });
      
      // 验证排序是否正确
      if (sortField === 'starLevel' && customers.length > 1) {
        const starLevels = customers.map(c => c.starLevel);
        let isCorrectlySorted = true;
        
        for (let i = 1; i < starLevels.length; i++) {
          if (sortOrder === 'ascend') {
            if (starLevels[i] < starLevels[i-1]) {
              isCorrectlySorted = false;
              break;
            }
          } else if (sortOrder === 'descend') {
            if (starLevels[i] > starLevels[i-1]) {
              isCorrectlySorted = false;
              break;
            }
          }
        }
        
        console.log(`\n🎯 排序验证: ${isCorrectlySorted ? '✅ 正确' : '❌ 错误'}`);
        console.log(`📈 星级序列: ${starLevels.join(' → ')}`);
      }
      
      return true;
    } else {
      console.error('❌ 获取客户列表失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试客户星级排序功能...\n');
  
  // 1. 登录
  const token = await login();
  if (!token) {
    console.error('❌ 无法获取认证token，测试终止');
    return;
  }
  
  // 2. 测试无排序
  await testCustomerList();
  
  // 3. 测试星级降序排序
  await testCustomerList('starLevel', 'descend');
  
  // 4. 测试星级升序排序
  await testCustomerList('starLevel', 'ascend');
  
  // 5. 测试最新跟进时间排序
  await testCustomerList('lastFollowTime', 'descend');
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
runTests().catch(console.error); 
const axios = require('axios');

async function testSorting() {
  try {
    // 1. 登录
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      phone: '13800000001',
      password: '123456'
    });
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功');

    // 2. 测试降序排序
    console.log('\n📊 测试星级降序排序:');
    const descendRes = await axios.get('http://localhost:3001/api/customers', {
      params: {
        page: 1,
        pageSize: 5,
        sortField: 'starLevel',
        sortOrder: 'descend'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    descendRes.data.data.list.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.starLevel}星`);
    });

    // 3. 测试升序排序
    console.log('\n📊 测试星级升序排序:');
    const ascendRes = await axios.get('http://localhost:3001/api/customers', {
      params: {
        page: 1,
        pageSize: 5,
        sortField: 'starLevel',
        sortOrder: 'ascend'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    ascendRes.data.data.list.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.starLevel}星`);
    });

    // 4. 测试最新跟进时间排序
    console.log('\n📊 测试最新跟进时间降序排序:');
    const followTimeRes = await axios.get('http://localhost:3001/api/customers', {
      params: {
        page: 1,
        pageSize: 5,
        sortField: 'lastFollowTime',
        sortOrder: 'descend'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    followTimeRes.data.data.list.forEach((customer, index) => {
      const followTime = customer.lastFollowTime || '无跟进';
      console.log(`${index + 1}. ${customer.name} - ${followTime}`);
    });

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testSorting(); 
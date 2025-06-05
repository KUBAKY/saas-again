const axios = require('axios');

async function testFollowRecordAPI() {
  try {
    console.log('🧪 测试跟进记录API...\n');
    
    // 1. 先登录获取token
    console.log('🔐 登录获取访问令牌...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      phone: '13800000000',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');
    
    // 2. 获取客户信息（添加跟进记录前）
    console.log('📋 获取客户信息（添加跟进记录前）...');
    const customerResponse = await axios.get('http://localhost:3001/api/customers/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const customerBefore = customerResponse.data.data;
    console.log(`客户ID: ${customerBefore.id}`);
    console.log(`客户姓名: ${customerBefore.name}`);
    console.log(`添加前最后跟进时间: ${customerBefore.lastFollowTime}\n`);
    
    // 3. 添加跟进记录
    console.log('📝 添加跟进记录...');
    const followTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const content = 'API测试跟进记录 - 验证时间更新';
    
    console.log(`跟进时间: ${followTime}`);
    console.log(`跟进内容: ${content}`);
    
    const addFollowResponse = await axios.post(`http://localhost:3001/api/customers/1/follow-records`, {
      content: content,
      followTime: followTime
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ 跟进记录添加成功\n');
    
    // 4. 再次获取客户信息（添加跟进记录后）
    console.log('📋 获取客户信息（添加跟进记录后）...');
    const customerAfterResponse = await axios.get('http://localhost:3001/api/customers/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const customerAfter = customerAfterResponse.data.data;
    console.log(`客户ID: ${customerAfter.id}`);
    console.log(`客户姓名: ${customerAfter.name}`);
    console.log(`添加后最后跟进时间: ${customerAfter.lastFollowTime}\n`);
    
    // 5. 验证结果
    if (customerAfter.lastFollowTime === followTime) {
      console.log('🎉 API测试成功！客户的最后跟进时间已正确更新');
      console.log('✅ 修复生效：添加跟进记录后，客户列表中的最新跟进时间会正确显示');
    } else {
      console.log('❌ API测试失败！客户的最后跟进时间未更新');
      console.log(`期望: ${followTime}`);
      console.log(`实际: ${customerAfter.lastFollowTime}`);
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testFollowRecordAPI(); 
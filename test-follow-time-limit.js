const axios = require('axios');

// 测试跟进时间72小时限制功能
async function testFollowTimeLimitFeature() {
  console.log('🧪 测试跟进时间72小时限制功能...\n');

  const baseURL = 'http://localhost:3001';
  
  // 从token.txt文件读取token
  const fs = require('fs');
  let token;
  try {
    token = fs.readFileSync('token.txt', 'utf8').trim();
    console.log('✅ 成功读取认证token');
  } catch (error) {
    console.log('❌ 无法读取token文件，请先登录');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. 测试正常的跟进时间（当前时间）
    console.log('📝 测试1: 添加当前时间的跟进记录...');
    const currentTime = new Date();
    const currentTimeStr = currentTime.getFullYear() + '-' + 
      String(currentTime.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentTime.getDate()).padStart(2, '0') + ' ' + 
      String(currentTime.getHours()).padStart(2, '0') + ':' + 
      String(currentTime.getMinutes()).padStart(2, '0') + ':' + 
      String(currentTime.getSeconds()).padStart(2, '0');
    
    const response1 = await axios.post(`${baseURL}/api/customers/1/follow-records`, {
      content: '测试当前时间跟进记录 - 应该成功',
      followTime: currentTimeStr
    }, { headers });
    
    if (response1.data.code === 200) {
      console.log('✅ 当前时间跟进记录添加成功');
    } else {
      console.log('❌ 当前时间跟进记录添加失败:', response1.data.message);
    }

    // 2. 测试24小时前的跟进时间（应该成功）
    console.log('\n📝 测试2: 添加24小时前的跟进记录...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twentyFourHoursAgoStr = twentyFourHoursAgo.getFullYear() + '-' + 
      String(twentyFourHoursAgo.getMonth() + 1).padStart(2, '0') + '-' + 
      String(twentyFourHoursAgo.getDate()).padStart(2, '0') + ' ' + 
      String(twentyFourHoursAgo.getHours()).padStart(2, '0') + ':' + 
      String(twentyFourHoursAgo.getMinutes()).padStart(2, '0') + ':' + 
      String(twentyFourHoursAgo.getSeconds()).padStart(2, '0');
    
    const response2 = await axios.post(`${baseURL}/api/customers/1/follow-records`, {
      content: '测试24小时前跟进记录 - 应该成功',
      followTime: twentyFourHoursAgoStr
    }, { headers });
    
    if (response2.data.code === 200) {
      console.log('✅ 24小时前跟进记录添加成功');
    } else {
      console.log('❌ 24小时前跟进记录添加失败:', response2.data.message);
    }

    // 3. 测试72小时前的跟进时间（边界情况，应该成功）
    console.log('\n📝 测试3: 添加72小时前的跟进记录...');
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const seventyTwoHoursAgoStr = seventyTwoHoursAgo.getFullYear() + '-' + 
      String(seventyTwoHoursAgo.getMonth() + 1).padStart(2, '0') + '-' + 
      String(seventyTwoHoursAgo.getDate()).padStart(2, '0') + ' ' + 
      String(seventyTwoHoursAgo.getHours()).padStart(2, '0') + ':' + 
      String(seventyTwoHoursAgo.getMinutes()).padStart(2, '0') + ':' + 
      String(seventyTwoHoursAgo.getSeconds()).padStart(2, '0');
    
    try {
      const response3 = await axios.post(`${baseURL}/api/customers/1/follow-records`, {
        content: '测试72小时前跟进记录 - 边界情况',
        followTime: seventyTwoHoursAgoStr
      }, { headers });
      
      if (response3.data.code === 200) {
        console.log('✅ 72小时前跟进记录添加成功');
      } else {
        console.log('❌ 72小时前跟进记录添加失败:', response3.data.message);
      }
    } catch (error) {
      console.log('❌ 72小时前跟进记录被拒绝:', error.response?.data?.message || error.message);
    }

    // 4. 测试未来时间（应该在前端被阻止，但后端也应该验证）
    console.log('\n📝 测试4: 尝试添加未来时间的跟进记录...');
    const futureTime = new Date(Date.now() + 60 * 60 * 1000); // 1小时后
    // 使用本地时间格式而不是UTC时间
    const futureTimeStr = futureTime.getFullYear() + '-' + 
      String(futureTime.getMonth() + 1).padStart(2, '0') + '-' + 
      String(futureTime.getDate()).padStart(2, '0') + ' ' + 
      String(futureTime.getHours()).padStart(2, '0') + ':' + 
      String(futureTime.getMinutes()).padStart(2, '0') + ':' + 
      String(futureTime.getSeconds()).padStart(2, '0');
    
    console.log(`调试信息 - 未来时间: ${futureTimeStr}`);
    const currentTimeForDebug = new Date();
    const currentTimeStrForDebug = currentTimeForDebug.getFullYear() + '-' + 
      String(currentTimeForDebug.getMonth() + 1).padStart(2, '0') + '-' + 
      String(currentTimeForDebug.getDate()).padStart(2, '0') + ' ' + 
      String(currentTimeForDebug.getHours()).padStart(2, '0') + ':' + 
      String(currentTimeForDebug.getMinutes()).padStart(2, '0') + ':' + 
      String(currentTimeForDebug.getSeconds()).padStart(2, '0');
    console.log(`调试信息 - 当前时间: ${currentTimeStrForDebug}`);
    
    try {
      const response4 = await axios.post(`${baseURL}/api/customers/1/follow-records`, {
        content: '测试未来时间跟进记录 - 应该失败',
        followTime: futureTimeStr
      }, { headers });
      
      if (response4.data.code === 200) {
        console.log('⚠️  未来时间跟进记录意外添加成功（需要后端验证）');
      }
    } catch (error) {
      console.log('✅ 未来时间跟进记录被正确拒绝:', error.response?.data?.message || error.message);
    }

    // 5. 测试超过72小时的过去时间（应该在前端被阻止，但后端也应该验证）
    console.log('\n📝 测试5: 尝试添加超过72小时前的跟进记录...');
    const moreThanSeventyTwoHoursAgo = new Date(Date.now() - 73 * 60 * 60 * 1000);
    const moreThanSeventyTwoHoursAgoStr = moreThanSeventyTwoHoursAgo.getFullYear() + '-' + 
      String(moreThanSeventyTwoHoursAgo.getMonth() + 1).padStart(2, '0') + '-' + 
      String(moreThanSeventyTwoHoursAgo.getDate()).padStart(2, '0') + ' ' + 
      String(moreThanSeventyTwoHoursAgo.getHours()).padStart(2, '0') + ':' + 
      String(moreThanSeventyTwoHoursAgo.getMinutes()).padStart(2, '0') + ':' + 
      String(moreThanSeventyTwoHoursAgo.getSeconds()).padStart(2, '0');
    
    try {
      const response5 = await axios.post(`${baseURL}/api/customers/1/follow-records`, {
        content: '测试超过72小时前跟进记录 - 应该失败',
        followTime: moreThanSeventyTwoHoursAgoStr
      }, { headers });
      
      if (response5.data.code === 200) {
        console.log('⚠️  超过72小时前跟进记录意外添加成功（需要后端验证）');
      }
    } catch (error) {
      console.log('✅ 超过72小时前跟进记录被正确拒绝:', error.response?.data?.message || error.message);
    }

    console.log('\n📊 测试总结:');
    console.log('- 前端时间选择器已添加72小时限制');
    console.log('- 用户只能在日期选择器中选择过去72小时内的时间');
    console.log('- 超出范围的日期和时间会被禁用');
    console.log('- 建议在后端也添加相应的验证逻辑');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testFollowTimeLimitFeature(); 
const axios = require('axios');
const fs = require('fs');

// 读取token
const token = fs.readFileSync('token.txt', 'utf8').trim().split('\n')[0];

const baseURL = 'http://localhost:3001/api';

async function testTimezoneFix() {
  console.log('🧪 测试跟进记录时区修复...\n');
  
  try {
    // 获取当前北京时间
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8
    const currentTime = beijingTime.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log('🕐 当前北京时间:', currentTime);
    
    // 1. 添加跟进记录，指定特定的跟进时间
    const followTime = '2025-06-05 23:45:00';
    const content = '测试时区修复 - 验证北京时间';
    
    console.log('\n📝 添加跟进记录...');
    console.log(`跟进时间: ${followTime}`);
    console.log(`跟进内容: ${content}`);
    
    const addResponse = await axios.post(`${baseURL}/customers/1/follow-records`, {
      content: content,
      followTime: followTime
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (addResponse.data.code === 200) {
      console.log('✅ 跟进记录添加成功\n');
    } else {
      console.log('❌ 跟进记录添加失败:', addResponse.data.message);
      return;
    }
    
    // 2. 获取最新的跟进记录
    console.log('📋 获取最新跟进记录...');
    const recordsResponse = await axios.get(`${baseURL}/customers/1/follow-records`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (recordsResponse.data.code === 200) {
      const records = recordsResponse.data.data.list;
      const latestRecord = records[0]; // 最新的记录
      
      console.log('📊 最新跟进记录信息:');
      console.log(`记录ID: ${latestRecord.id}`);
      console.log(`跟进时间 (follow_time): ${latestRecord.follow_time}`);
      console.log(`创建时间 (created_at): ${latestRecord.created_at}`);
      console.log(`跟进内容: ${latestRecord.content}`);
      console.log(`跟进人: ${latestRecord.user_name}\n`);
      
      // 3. 验证时区
      const followTimeFromDB = latestRecord.follow_time;
      const createdTimeFromDB = latestRecord.created_at;
      
      console.log('🔍 时区验证:');
      
      // 验证跟进时间是否与用户指定的时间一致
      if (followTimeFromDB === followTime) {
        console.log('✅ 跟进时间正确: 与用户指定时间一致');
      } else {
        console.log('❌ 跟进时间错误: 与用户指定时间不一致');
        console.log(`  期望: ${followTime}`);
        console.log(`  实际: ${followTimeFromDB}`);
      }
      
      // 验证创建时间是否为北京时间
      const createdTime = new Date(createdTimeFromDB + ' GMT+0800');
      const currentBeijingTime = new Date();
      const timeDiff = Math.abs(currentBeijingTime.getTime() - createdTime.getTime()) / 1000; // 秒
      
      if (timeDiff < 60) { // 1分钟内
        console.log('✅ 创建时间正确: 为北京时间，与当前时间相近');
      } else {
        console.log('❌ 创建时间可能有问题: 与当前时间差距较大');
        console.log(`  时间差: ${timeDiff} 秒`);
      }
      
      // 验证创建时间格式是否为北京时间格式
      const createdHour = parseInt(createdTimeFromDB.split(' ')[1].split(':')[0]);
      const currentHour = currentBeijingTime.getHours();
      
      if (Math.abs(createdHour - currentHour) <= 1) {
        console.log('✅ 时区修复成功: 创建时间显示为北京时间');
      } else {
        console.log('❌ 时区修复失败: 创建时间可能仍为UTC时间');
        console.log(`  创建时间小时: ${createdHour}`);
        console.log(`  当前北京时间小时: ${currentHour}`);
      }
      
      console.log('\n🎉 时区修复验证完成！');
      
      // 4. 显示修复前后的对比
      console.log('\n📈 时区修复效果对比:');
      console.log('修复前:');
      console.log('  - 创建时间显示UTC时间（比北京时间慢8小时）');
      console.log('  - 用户看到的时间与实际时间不符');
      console.log('  - 影响用户体验和数据准确性');
      console.log('修复后:');
      console.log('  - 创建时间显示北京时间（本地时间）');
      console.log('  - 用户看到的时间与实际时间一致');
      console.log('  - 提高用户体验和数据可读性');
      
    } else {
      console.log('❌ 获取跟进记录失败:', recordsResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data?.message || error.message);
  }
}

// 运行测试
testTimezoneFix(); 
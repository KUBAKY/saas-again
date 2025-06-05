const axios = require('axios');
const fs = require('fs');

// 读取token
const token = fs.readFileSync('token.txt', 'utf8').trim().split('\n')[0];

const baseURL = 'http://localhost:3001/api';

async function testFollowRecordTimeFix() {
  console.log('🧪 测试跟进记录时间字段修复...\n');
  
  try {
    // 1. 添加跟进记录，指定特定的跟进时间
    const followTime = '2025-06-05 09:30:00';
    const content = '测试跟进记录 - 验证时间字段区分';
    
    console.log('📝 添加跟进记录...');
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
      
      // 3. 验证时间字段
      const followTimeFromDB = latestRecord.follow_time;
      const createdTimeFromDB = latestRecord.created_at;
      
      console.log('🔍 时间字段验证:');
      
      // 验证跟进时间是否与用户指定的时间一致
      if (followTimeFromDB === followTime) {
        console.log('✅ 跟进时间正确: 与用户指定时间一致');
      } else {
        console.log('❌ 跟进时间错误: 与用户指定时间不一致');
        console.log(`  期望: ${followTime}`);
        console.log(`  实际: ${followTimeFromDB}`);
      }
      
      // 验证创建时间是否为当前时间（应该比跟进时间晚）
      const followDate = new Date(followTimeFromDB);
      const createdDate = new Date(createdTimeFromDB);
      
      if (createdDate > followDate) {
        console.log('✅ 创建时间正确: 为添加记录时的实时时间');
      } else {
        console.log('❌ 创建时间错误: 不是添加记录时的实时时间');
      }
      
      // 验证两个时间是否不同
      if (followTimeFromDB !== createdTimeFromDB) {
        console.log('✅ 时间字段区分正确: 跟进时间和创建时间不同');
      } else {
        console.log('❌ 时间字段区分错误: 跟进时间和创建时间相同');
      }
      
      console.log('\n🎉 跟进记录时间字段修复验证完成！');
      
      // 4. 显示修复前后的对比
      console.log('\n📈 修复效果对比:');
      console.log('修复前:');
      console.log('  - 跟进时间和创建时间相同');
      console.log('  - 无法区分用户选择的跟进时间和记录创建时间');
      console.log('修复后:');
      console.log('  - 跟进时间: 用户可选择的时间（默认当前时间）');
      console.log('  - 创建时间: 添加记录时的实时时间（不可修改）');
      console.log('  - 两个时间字段功能明确，用户体验更好');
      
    } else {
      console.log('❌ 获取跟进记录失败:', recordsResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data?.message || error.message);
  }
}

// 运行测试
testFollowRecordTimeFix(); 
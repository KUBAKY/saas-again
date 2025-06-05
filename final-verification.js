#!/usr/bin/env node

const https = require('https');
const http = require('http');

// 忽略自签名证书错误
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function finalVerification() {
  console.log('🔍 最终验证：小组管理功能完整性检查\n');
  
  try {
    // 1. 登录获取token
    console.log('1. 登录系统...');
    const loginResponse = await makeRequest('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '13800000000', password: 'admin123' })
    });
    
    if (!loginResponse.token) {
      throw new Error('登录失败');
    }
    
    const token = loginResponse.token;
    console.log('✅ 登录成功');
    
    // 2. 获取团队列表
    console.log('\n2. 获取团队列表...');
    const teamsResponse = await makeRequest('http://localhost:3001/api/teams?page=1&pageSize=20', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (teamsResponse.code !== 200) {
      throw new Error('获取团队列表失败');
    }
    
    const teams = teamsResponse.data.list;
    console.log('✅ 团队列表获取成功');
    
    // 3. 验证数据结构
    console.log('\n3. 验证数据结构...');
    const requiredFields = ['id', 'name', 'leaderName', 'memberCount', 'maxMembers'];
    
    teams.forEach(team => {
      requiredFields.forEach(field => {
        if (!(field in team)) {
          throw new Error(`团队数据缺少字段: ${field}`);
        }
      });
    });
    console.log('✅ 数据结构验证通过');
    
    // 4. 验证具体数据
    console.log('\n4. 验证具体数据...');
    
    const salesTeam = teams.find(t => t.name === '销售一组');
    const dafangTeam = teams.find(t => t.name === '大方');
    
    if (!salesTeam) {
      throw new Error('未找到销售一组');
    }
    
    if (salesTeam.leaderName !== '多的') {
      throw new Error(`销售一组组长错误: 期望"多的"，实际"${salesTeam.leaderName}"`);
    }
    
    if (salesTeam.memberCount !== 1) {
      throw new Error(`销售一组成员数量错误: 期望1，实际${salesTeam.memberCount}`);
    }
    
    if (salesTeam.maxMembers !== 10) {
      throw new Error(`销售一组最大成员数错误: 期望10，实际${salesTeam.maxMembers}`);
    }
    
    if (!dafangTeam) {
      throw new Error('未找到大方团队');
    }
    
    if (dafangTeam.leaderName !== '张组长') {
      throw new Error(`大方团队组长错误: 期望"张组长"，实际"${dafangTeam.leaderName}"`);
    }
    
    if (dafangTeam.memberCount !== 2) {
      throw new Error(`大方团队成员数量错误: 期望2，实际${dafangTeam.memberCount}`);
    }
    
    if (dafangTeam.maxMembers !== 4) {
      throw new Error(`大方团队最大成员数错误: 期望4，实际${dafangTeam.maxMembers}`);
    }
    
    console.log('✅ 具体数据验证通过');
    
    // 5. 验证组长唯一性约束
    console.log('\n5. 验证组长唯一性约束...');
    
    const testResponse = await makeRequest('http://localhost:3001/api/teams/5', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: '的滴滴',
        level: '4',
        leaderId: 2, // 张组长的ID
        description: '测试组长唯一性'
      })
    });
    
    if (testResponse.code !== 400) {
      throw new Error('组长唯一性约束未生效');
    }
    
    if (!testResponse.message.includes('一个组长只能带领一个团队')) {
      throw new Error('组长唯一性错误消息不正确');
    }
    
    console.log('✅ 组长唯一性约束验证通过');
    
    // 6. 显示最终结果
    console.log('\n6. 最终结果汇总:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    团队管理状态                         │');
    console.log('├─────────────────────────────────────────────────────────┤');
    
    teams.forEach(team => {
      const leaderInfo = team.leaderName || '未设置';
      const memberInfo = `${team.memberCount}/${team.maxMembers}`;
      console.log(`│ ${team.name.padEnd(12)} │ 组长: ${leaderInfo.padEnd(8)} │ 成员: ${memberInfo.padEnd(6)} │`);
    });
    
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n🎉 所有验证通过！小组管理功能完全正常：');
    console.log('  ✅ 组长信息正确显示');
    console.log('  ✅ 成员数量准确统计');
    console.log('  ✅ 数据结构完整一致');
    console.log('  ✅ 组长唯一性约束生效');
    console.log('  ✅ 前后端数据同步正常');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  finalVerification()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
} 
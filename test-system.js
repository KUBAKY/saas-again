#!/usr/bin/env node

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testSystem() {
  try {
    console.log('🧪 开始系统功能测试...\n');
    
    // 1. 测试登录
    console.log('1. 测试管理员登录...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      phone: '13800000000',
      password: 'admin123'
    });
    
    if (loginResponse.data.code === 200) {
      console.log('✅ 管理员登录成功');
      const token = loginResponse.data.data.token;
      
      // 2. 测试获取团队列表
      console.log('\n2. 测试获取团队列表...');
      const teamsResponse = await axios.get(`${API_BASE}/teams?pageSize=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (teamsResponse.data.code === 200) {
        const teamsData = teamsResponse.data.data;
        const teams = teamsData.list || [];
        console.log(`✅ 获取团队列表成功，共 ${teams.length} 个团队`);
        
        // 显示8812系列团队
        const newTeams = teams.filter(team => team.name && team.name.includes('8812'));
        console.log(`\n📊 8812系列团队: ${newTeams.length} 个`);
        newTeams.forEach(team => {
          console.log(`  - ${team.name}: 领导=${team.leaderName || '未分配'}, 成员=${team.memberCount || 0}人`);
        });
        
        // 显示所有团队的概览
        console.log('\n📋 所有团队概览:');
        const teamGroups = {};
        teams.forEach(team => {
          const match = team.name.match(/(\d{4})/);
          const groupId = match ? match[1] : 'other';
          if (!teamGroups[groupId]) teamGroups[groupId] = [];
          teamGroups[groupId].push(team);
        });
        
        Object.keys(teamGroups).sort().forEach(groupId => {
          console.log(`  ${groupId}系列: ${teamGroups[groupId].length} 个团队`);
        });
        
        // 3. 测试获取用户列表
        console.log('\n3. 测试获取用户列表...');
        const usersResponse = await axios.get(`${API_BASE}/users?pageSize=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (usersResponse.data.code === 200) {
          const usersData = usersResponse.data.data;
          const users = usersData.list || [];
          console.log(`✅ 获取用户列表成功，共 ${users.length} 个用户`);
          
          // 显示新团队的用户
          const newTeamUsers = users.filter(user => 
            user.team_name && user.team_name.includes('8812')
          );
          console.log(`\n👥 8812系列团队用户: ${newTeamUsers.length} 人`);
          if (newTeamUsers.length > 0) {
            newTeamUsers.forEach(user => {
              console.log(`  - ${user.name} (${user.role}) - ${user.team_name}`);
            });
          }
        }
        
        // 4. 测试获取客户列表
        console.log('\n4. 测试获取客户列表...');
        const customersResponse = await axios.get(`${API_BASE}/customers?pageSize=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (customersResponse.data.code === 200) {
          const customersData = customersResponse.data.data;
          const customers = customersData.list || [];
          console.log(`✅ 获取客户列表成功，共 ${customers.length} 个客户`);
          
          // 显示分配给新团队的客户
          const newTeamCustomers = customers.filter(customer => 
            customer.team_name && customer.team_name.includes('8812')
          );
          console.log(`\n👤 分配给8812系列团队的客户: ${newTeamCustomers.length} 个`);
          
          // 按团队分组显示客户分配情况
          if (newTeamCustomers.length > 0) {
            const customersByTeam = {};
            newTeamCustomers.forEach(customer => {
              const teamName = customer.team_name;
              if (!customersByTeam[teamName]) customersByTeam[teamName] = [];
              customersByTeam[teamName].push(customer);
            });
            
            console.log('\n📊 8812系列团队客户分配详情:');
            Object.keys(customersByTeam).sort().forEach(teamName => {
              console.log(`  ${teamName}: ${customersByTeam[teamName].length} 个客户`);
            });
          }
        }
        
      } else {
        console.log('❌ 获取团队列表失败:', teamsResponse.data.message);
      }
      
    } else {
      console.log('❌ 管理员登录失败:', loginResponse.data.message);
    }
    
    console.log('\n🎉 系统功能测试完成！');
    console.log('\n📱 前端访问地址: http://localhost:3000');
    console.log('🔧 后端API地址: http://localhost:3001/api');
    console.log('\n👤 测试账号:');
    console.log('  管理员: 13800000000 / admin123');
    console.log('  销售员: 查看数据库中的其他用户');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

testSystem(); 
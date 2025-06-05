const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testTeamMemberLimit() {
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
    
    // 2. 获取团队列表，找到人数已满或接近满的团队
    console.log('\n📋 获取团队列表...');
    const teamsResponse = await axios.get(`${BASE_URL}/teams?pageSize=50`, { headers });
    const teams = teamsResponse.data.data.list;
    
    console.log('团队列表:');
    teams.forEach(team => {
      const usage = `${team.memberCount}/${team.maxMembers}`;
      const status = team.memberCount >= team.maxMembers ? '🔴 已满' : 
                    team.memberCount >= team.maxMembers - 1 ? '🟡 接近满' : '🟢 有空位';
      console.log(`- ${team.name}: ${usage} ${status}`);
    });
    
    // 找一个已满的团队和一个有空位的团队
    const fullTeam = teams.find(team => team.memberCount >= team.maxMembers);
    const availableTeam = teams.find(team => team.memberCount < team.maxMembers);
    
    if (!fullTeam) {
      console.log('\n⚠️  没有找到已满的团队，创建一个测试团队...');
      
      // 创建一个4人小组用于测试
      const createTeamResponse = await axios.post(`${BASE_URL}/teams`, {
        name: `测试团队${Date.now()}`,
        level: '4',
        description: '用于测试人数限制的团队'
      }, { headers });
      
      const newTeamId = createTeamResponse.data.data.id;
      console.log(`✅ 创建测试团队成功，ID: ${newTeamId}`);
      
      // 获取一些用户来填满这个团队
      const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=10&role=sales`, { headers });
      const users = usersResponse.data.data.list.filter(user => !user.teamId);
      
      if (users.length >= 4) {
        // 将4个用户加入团队
        const userIds = users.slice(0, 4).map(user => user.id);
        await axios.post(`${BASE_URL}/users/batch-update-team`, {
          userIds,
          teamId: newTeamId
        }, { headers });
        
        console.log(`✅ 已将4个用户加入测试团队，团队现在应该已满`);
        
        // 重新获取团队信息
        const updatedTeamsResponse = await axios.get(`${BASE_URL}/teams?pageSize=50`, { headers });
        const updatedTeams = updatedTeamsResponse.data.data.list;
        const testTeam = updatedTeams.find(team => team.id === newTeamId);
        
        if (testTeam) {
          console.log(`测试团队状态: ${testTeam.memberCount}/${testTeam.maxMembers}`);
          
          // 现在测试添加第5个用户（应该失败）
          const extraUser = users.find(user => !userIds.includes(user.id));
          if (extraUser) {
            console.log('\n🧪 测试1: 尝试向已满团队添加新用户（应该失败）...');
            try {
              await axios.put(`${BASE_URL}/users/${extraUser.id}`, {
                phone: extraUser.phone,
                name: extraUser.name,
                role: extraUser.role,
                teamId: newTeamId,
                joinDate: extraUser.joinDate,
                status: extraUser.status
              }, { headers });
              
              console.log('❌ 测试失败：应该拒绝添加用户到已满团队');
            } catch (error) {
              if (error.response?.status === 400) {
                console.log('✅ 测试成功：正确拒绝了添加用户到已满团队');
                console.log(`   错误信息: ${error.response.data.message}`);
              } else {
                console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
              }
            }
            
            // 测试批量添加到已满团队
            console.log('\n🧪 测试2: 尝试批量添加用户到已满团队（应该失败）...');
            try {
              await axios.post(`${BASE_URL}/users/batch-update-team`, {
                userIds: [extraUser.id],
                teamId: newTeamId
              }, { headers });
              
              console.log('❌ 测试失败：应该拒绝批量添加用户到已满团队');
            } catch (error) {
              if (error.response?.status === 400) {
                console.log('✅ 测试成功：正确拒绝了批量添加用户到已满团队');
                console.log(`   错误信息: ${error.response.data.message}`);
              } else {
                console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
              }
            }
            
            // 测试创建新用户并分配到已满团队
            console.log('\n🧪 测试3: 尝试创建新用户并分配到已满团队（应该失败）...');
            try {
              await axios.post(`${BASE_URL}/users`, {
                phone: `139${Date.now().toString().slice(-8)}`,
                password: 'test123456',
                name: '测试用户',
                role: 'sales',
                teamId: newTeamId,
                joinDate: '2025-06-03'
              }, { headers });
              
              console.log('❌ 测试失败：应该拒绝创建用户并分配到已满团队');
            } catch (error) {
              if (error.response?.status === 400) {
                console.log('✅ 测试成功：正确拒绝了创建用户并分配到已满团队');
                console.log(`   错误信息: ${error.response.data.message}`);
              } else {
                console.log('❌ 测试失败：返回了意外的错误', error.response?.data);
              }
            }
          }
        }
      }
    }
    
    // 测试正常情况：添加用户到有空位的团队
    if (availableTeam) {
      console.log(`\n🧪 测试4: 添加用户到有空位的团队"${availableTeam.name}"（应该成功）...`);
      
      const usersResponse = await axios.get(`${BASE_URL}/users?pageSize=50&role=sales`, { headers });
      const users = usersResponse.data.data.list.filter(user => !user.teamName && !user.teamId);
      
      if (users.length > 0) {
        const testUser = users[0];
        console.log(`选择用户: ${testUser.name} (当前团队: ${testUser.teamName || '无'})`);
        
        try {
          await axios.put(`${BASE_URL}/users/${testUser.id}`, {
            phone: testUser.phone,
            name: testUser.name,
            role: testUser.role,
            teamId: availableTeam.id,
            joinDate: testUser.joinDate,
            status: testUser.status || 'active'
          }, { headers });
          
          console.log('✅ 测试成功：成功添加用户到有空位的团队');
          
          // 恢复用户状态（移除团队分配）
          await axios.put(`${BASE_URL}/users/${testUser.id}`, {
            phone: testUser.phone,
            name: testUser.name,
            role: testUser.role,
            teamId: null,
            joinDate: testUser.joinDate,
            status: testUser.status || 'active'
          }, { headers });
          
          console.log('✅ 已恢复用户的团队分配状态');
        } catch (error) {
          console.log('❌ 测试失败：无法添加用户到有空位的团队', error.response?.data);
          console.log('用户数据:', testUser);
        }
      } else {
        console.log('⚠️  没有找到未分配团队的用户');
      }
    }
    
    console.log('\n🎉 团队人数限制功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testTeamMemberLimit(); 
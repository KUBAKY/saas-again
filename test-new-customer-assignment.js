const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// 测试账号
const testAccounts = {
  manager: { phone: '13800000001', password: '123456' }, // 总经理 (ID: 2)
  leader1: { phone: '13800000002', password: '123456' }, // 组长1
  sales1: { phone: '13800000003', password: '123456' }   // 销售员1
};

// 登录获取token
async function login(phone, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      phone,
      password
    });
    return response.data.data.token;
  } catch (error) {
    console.error(`登录失败 (${phone}):`, error.response?.data?.message || error.message);
    return null;
  }
}

// 获取小组信息
async function getTeams(token) {
  try {
    const response = await axios.get(`${API_BASE}/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.list;
  } catch (error) {
    console.error('获取小组失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 获取用户信息
async function getUsers(token) {
  try {
    const response = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.list;
  } catch (error) {
    console.error('获取用户失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 获取当前用户信息
async function getCurrentUser(token) {
  try {
    const response = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('获取当前用户失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 创建客户
async function createCustomer(token, customerData) {
  try {
    const response = await axios.post(`${API_BASE}/customers`, customerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('🔍 客户创建响应:', JSON.stringify(response.data, null, 2));
    return {
      success: true,
      data: response.data,
      customerId: response.data.data?.id
    };
  } catch (error) {
    console.log('❌ 客户创建失败响应:', JSON.stringify(error.response?.data, null, 2));
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// 获取客户详情
async function getCustomer(token, customerId) {
  try {
    const response = await axios.get(`${API_BASE}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('获取客户详情失败:', error.response?.data?.message || error.message);
    console.error('错误详情:', error.response?.data);
    return null;
  }
}

async function testNewCustomerAssignment() {
  console.log('🧪 开始测试新的客户归属逻辑...\n');

  // 1. 登录总经理账号
  console.log('1. 登录总经理账号...');
  const managerToken = await login(testAccounts.manager.phone, testAccounts.manager.password);
  if (!managerToken) {
    console.error('❌ 总经理登录失败');
    return;
  }
  console.log('✅ 总经理登录成功\n');

  // 2. 获取小组和用户信息
  console.log('2. 获取系统信息...');
  const teams = await getTeams(managerToken);
  const users = await getUsers(managerToken);
  
  // 我们知道登录的是ID为2的总经理
  const currentManagerId = 2;
  const currentManager = users.find(u => u.id === currentManagerId);
  
  console.log('📋 小组信息:');
  teams.forEach(team => {
    const leader = users.find(u => u.id === team.leaderId);
    console.log(`  - ${team.name} (ID: ${team.id}) - 组长: ${leader?.name || '未设置'} (ID: ${team.leaderId || 'N/A'})`);
  });
  
  console.log('\n👥 用户信息:');
  console.log(`  - 当前登录总经理: ${currentManager?.name} (ID: ${currentManager?.id})`);
  
  const leaders = users.filter(u => u.role === 'leader');
  leaders.forEach(leader => {
    console.log(`  - 组长: ${leader.name} (ID: ${leader.id}) - 小组: ${leader.teamId}`);
  });
  
  const salespeople = users.filter(u => u.role === 'sales');
  salespeople.slice(0, 3).forEach(sales => {
    console.log(`  - 销售员: ${sales.name} (ID: ${sales.id}) - 小组: ${sales.teamId}`);
  });

  console.log('\n3. 开始测试客户创建场景...\n');

  // 测试场景1: 不选择小组，应该归属到总经理
  console.log('📝 场景1: 不选择小组和销售员');
  const customer1Data = {
    starLevel: 3,
    name: `测试客户1-${Date.now()}`,
    phone: `139${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    gender: 'male',
    age: 30,
    qualification: '测试客户资质1'
  };

  const result1 = await createCustomer(managerToken, customer1Data);
  if (result1.success) {
    console.log(`✅ 客户创建成功，ID: ${result1.customerId}`);
    
    // 等待一下再获取详情
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const customer1 = await getCustomer(managerToken, result1.customerId);
    if (customer1) {
      console.log(`   客户姓名: ${customer1.name}`);
      console.log(`   归属销售员: ${customer1.owner?.name || '未知'} (ID: ${customer1.ownerId})`);
      console.log(`   归属小组: ${customer1.team?.name || '无'} (ID: ${customer1.teamId || 'N/A'})`);
      
      if (customer1.ownerId === currentManager?.id) {
        console.log('✅ 验证通过: 正确归属到总经理');
      } else {
        console.log('❌ 验证失败: 未正确归属到总经理');
        console.log(`   期望归属到总经理 (ID: ${currentManager?.id})，实际归属到 (ID: ${customer1.ownerId})`);
      }
    } else {
      console.log('❌ 无法获取客户详情，可能是权限问题');
      // 尝试通过客户列表获取
      try {
        const listResponse = await axios.get(`${API_BASE}/customers?search=${customer1Data.name}`, {
          headers: { Authorization: `Bearer ${managerToken}` }
        });
        const foundCustomer = listResponse.data.data.list.find(c => c.id === result1.customerId);
        if (foundCustomer) {
          console.log(`   通过列表查询到客户: ${foundCustomer.name}`);
          console.log(`   归属销售员: ${foundCustomer.owner?.name || '未知'} (ID: ${foundCustomer.ownerId})`);
          console.log(`   归属小组: ${foundCustomer.team?.name || '无'} (ID: ${foundCustomer.teamId || 'N/A'})`);
        }
      } catch (listError) {
        console.log('   通过列表查询也失败了');
      }
    }
  } else {
    console.log('❌ 客户创建失败:', result1.error.message);
  }

  console.log('\n📝 场景2: 只选择小组，不选择销售员');
  const team1 = teams[0]; // 选择第一个小组
  const customer2Data = {
    starLevel: 4,
    name: `测试客户2-${Date.now()}`,
    phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    gender: 'female',
    age: 25,
    qualification: '测试客户资质2',
    teamId: team1.id
  };

  const result2 = await createCustomer(managerToken, customer2Data);
  if (result2.success) {
    console.log(`✅ 客户创建成功，ID: ${result2.customerId}`);
    
    // 等待一下再获取详情
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const customer2 = await getCustomer(managerToken, result2.customerId);
    if (customer2) {
      console.log(`   客户姓名: ${customer2.name}`);
      console.log(`   归属销售员: ${customer2.owner?.name || '未知'} (ID: ${customer2.ownerId})`);
      console.log(`   归属小组: ${customer2.team?.name || '无'} (ID: ${customer2.teamId})`);
      
      if (customer2.ownerId === team1.leaderId) {
        console.log('✅ 验证通过: 正确归属到组长');
      } else {
        console.log('❌ 验证失败: 未正确归属到组长');
        console.log(`   期望归属到组长 (ID: ${team1.leaderId})，实际归属到 (ID: ${customer2.ownerId})`);
      }
    } else {
      console.log('❌ 无法获取客户详情');
    }
  } else {
    console.log('❌ 客户创建失败:', result2.error.message);
  }

  console.log('\n📝 场景3: 选择小组和销售员');
  const team2 = teams.find(t => t.id !== team1.id) || team1; // 选择不同的小组
  const teamSales = salespeople.find(s => s.teamId === team2.id);
  
  if (teamSales) {
    const customer3Data = {
      starLevel: 5,
      name: `测试客户3-${Date.now()}`,
      phone: `137${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      gender: 'male',
      age: 35,
      qualification: '测试客户资质3',
      teamId: team2.id,
      ownerId: teamSales.id
    };

    const result3 = await createCustomer(managerToken, customer3Data);
    if (result3.success) {
      console.log(`✅ 客户创建成功，ID: ${result3.customerId}`);
      
      // 等待一下再获取详情
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const customer3 = await getCustomer(managerToken, result3.customerId);
      if (customer3) {
        console.log(`   客户姓名: ${customer3.name}`);
        console.log(`   归属销售员: ${customer3.owner?.name || '未知'} (ID: ${customer3.ownerId})`);
        console.log(`   归属小组: ${customer3.team?.name || '无'} (ID: ${customer3.teamId})`);
        
        if (customer3.ownerId === teamSales.id && customer3.teamId === team2.id) {
          console.log('✅ 验证通过: 正确归属到指定销售员和小组');
        } else {
          console.log('❌ 验证失败: 未正确归属到指定销售员和小组');
          console.log(`   期望归属到销售员 (ID: ${teamSales.id}) 和小组 (ID: ${team2.id})`);
          console.log(`   实际归属到销售员 (ID: ${customer3.ownerId}) 和小组 (ID: ${customer3.teamId})`);
        }
      } else {
        console.log('❌ 无法获取客户详情');
      }
    } else {
      console.log('❌ 客户创建失败:', result3.error.message);
    }
  } else {
    console.log('⚠️ 跳过场景3: 找不到合适的销售员');
  }

  console.log('\n🎉 客户归属逻辑测试完成！');
}

// 运行测试
testNewCustomerAssignment().catch(console.error); 
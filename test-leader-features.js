const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试用户凭据
const testUsers = {
  admin: { phone: '13800000000', password: '123456' },
  manager: { phone: '13800000001', password: '123456' },
  leader: { phone: '13800000002', password: '123456' },
  sales: { phone: '13800000003', password: '123456' }
};

let tokens = {};

// 登录获取token
async function login(role) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, testUsers[role]);
    tokens[role] = response.data.data.token;
    console.log(`✅ ${role} 登录成功`);
    return response.data.data.user;
  } catch (error) {
    console.log(`❌ ${role} 登录失败:`, error.response?.data?.message || error.message);
    return null;
  }
}

// 测试组长查看小组成员列表
async function testLeaderViewTeamMembers() {
  console.log('\n🧪 测试组长查看小组成员列表...');
  
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    
    const users = response.data.data.list;
    console.log(`✅ 组长可以查看用户列表，共 ${users.length} 个用户`);
    
    // 获取组长的团队ID
    const leaderResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    const leaderTeamId = leaderResponse.data.data.teamId;
    
    // 检查是否只能看到本组成员
    const nonTeamMembers = users.filter(user => user.teamId && user.teamId !== leaderTeamId);
    
    if (nonTeamMembers.length === 0) {
      console.log('✅ 组长只能查看本组成员，权限控制正确');
    } else {
      console.log(`⚠️  组长可以看到其他组成员: ${nonTeamMembers.map(u => u.name).join(', ')}`);
    }
    
    return { users, leaderTeamId };
  } catch (error) {
    console.log('❌ 组长查看用户列表失败:', error.response?.data?.message || error.message);
    return { users: [], leaderTeamId: null };
  }
}

// 测试组长查看小组客户数据
async function testLeaderViewTeamCustomers(leaderTeamId) {
  console.log('\n🧪 测试组长查看小组客户数据...');
  
  try {
    const response = await axios.get(`${BASE_URL}/customers`, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    
    const customers = response.data.data.list;
    console.log(`✅ 组长可以查看客户列表，共 ${customers.length} 个客户`);
    
    // 检查是否只能看到本组客户
    const nonTeamCustomers = customers.filter(customer => customer.teamId && customer.teamId !== leaderTeamId);
    
    if (nonTeamCustomers.length === 0) {
      console.log('✅ 组长只能查看本组客户，权限控制正确');
    } else {
      console.log(`⚠️  组长可以看到其他组客户: ${nonTeamCustomers.length} 个`);
    }
    
    return customers;
  } catch (error) {
    console.log('❌ 组长查看客户列表失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 测试组长查看跟进记录
async function testLeaderViewFollowRecords() {
  console.log('\n🧪 测试组长查看跟进记录...');
  
  try {
    const response = await axios.get(`${BASE_URL}/followRecords`, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    
    const records = response.data.data.list;
    console.log(`✅ 组长可以查看跟进记录，共 ${records.length} 条记录`);
    return records;
  } catch (error) {
    console.log('❌ 组长查看跟进记录失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 测试组长批量转移客户
async function testLeaderTransferCustomers(customers) {
  console.log('\n🧪 测试组长批量转移客户...');
  
  if (customers.length < 2) {
    console.log('⚠️  客户数量不足，跳过转移测试');
    return;
  }
  
  try {
    // 获取本组的销售员列表
    const usersResponse = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    
    const teamMembers = usersResponse.data.data.list.filter(user => user.role === 'sales');
    
    if (teamMembers.length < 2) {
      console.log('⚠️  本组销售员数量不足，跳过转移测试');
      return;
    }
    
    const sourceCustomer = customers[0];
    const targetSales = teamMembers.find(member => member.id !== sourceCustomer.ownerId);
    
    if (!targetSales) {
      console.log('⚠️  找不到合适的目标销售员，跳过转移测试');
      return;
    }
    
    const transferData = {
      customerIds: [sourceCustomer.id],
      targetOwnerId: targetSales.id,
      targetTeamId: targetSales.teamId
    };
    
    const response = await axios.post(`${BASE_URL}/customers/transfer`, transferData, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    
    console.log(`✅ 组长成功转移客户 "${sourceCustomer.name}" 给 "${targetSales.name}"`);
    return true;
  } catch (error) {
    console.log('❌ 组长转移客户失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试组长查看用户详情
async function testLeaderViewUserDetail(users) {
  console.log('\n🧪 测试组长查看用户详情...');
  
  if (users.length === 0) {
    console.log('⚠️  没有用户可查看，跳过详情测试');
    return;
  }
  
  const testUser = users.find(user => user.role === 'sales');
  if (!testUser) {
    console.log('⚠️  没有销售员可查看，跳过详情测试');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/users/${testUser.id}`, {
      headers: { Authorization: `Bearer ${tokens.leader}` }
    });
    
    const userDetail = response.data.data;
    console.log(`✅ 组长可以查看用户详情: ${userDetail.name} (${userDetail.phone})`);
    return userDetail;
  } catch (error) {
    console.log('❌ 组长查看用户详情失败:', error.response?.data?.message || error.message);
    return null;
  }
}

// 测试组长权限边界
async function testLeaderPermissionBoundary() {
  console.log('\n🧪 测试组长权限边界...');
  
  try {
    // 尝试访问其他组的用户详情（应该失败）
    const otherTeamUserId = 1; // 假设这是其他组的用户
    
    try {
      await axios.get(`${BASE_URL}/users/${otherTeamUserId}`, {
        headers: { Authorization: `Bearer ${tokens.leader}` }
      });
      console.log('⚠️  组长可以查看其他组用户详情，权限控制可能有问题');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 组长无法查看其他组用户详情，权限控制正确');
      } else {
        console.log('❌ 权限测试出现意外错误:', error.response?.data?.message);
      }
    }
    
    // 尝试创建用户（应该失败）
    try {
      await axios.post(`${BASE_URL}/users`, {
        phone: '13900000999',
        name: '测试用户',
        role: 'sales',
        joinDate: '2024-01-01'
      }, {
        headers: { Authorization: `Bearer ${tokens.leader}` }
      });
      console.log('⚠️  组长可以创建用户，权限控制可能有问题');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 组长无法创建用户，权限控制正确');
      } else {
        console.log('❌ 创建用户测试出现意外错误:', error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.log('❌ 权限边界测试失败:', error.message);
  }
}

// 主测试函数
async function runLeaderTests() {
  console.log('🚀 开始测试组长功能...\n');

  // 1. 登录
  console.log('1. 登录测试');
  const leaderUser = await login('leader');
  if (!leaderUser) {
    console.log('❌ 组长登录失败，无法继续测试');
    return;
  }
  console.log(`组长信息: ${leaderUser.name} (${leaderUser.phone}), 团队ID: ${leaderUser.teamId}`);

  // 2. 查看小组成员列表
  const { users, leaderTeamId } = await testLeaderViewTeamMembers();

  // 3. 查看小组客户数据
  const teamCustomers = await testLeaderViewTeamCustomers(leaderTeamId);

  // 4. 查看跟进记录
  await testLeaderViewFollowRecords();

  // 5. 查看用户详情
  await testLeaderViewUserDetail(users);

  // 6. 批量转移客户
  await testLeaderTransferCustomers(teamCustomers);

  // 7. 权限边界测试
  await testLeaderPermissionBoundary();

  console.log('\n✨ 组长功能测试完成！');
}

// 运行测试
runLeaderTests().catch(console.error); 
const axios = require('axios');

// 配置基础URL
const BASE_URL = 'http://localhost:3000/api/v1';

// 测试数据
const testData = {
  admin: {
    email: 'admin@gym-saas.com',
    password: 'admin123456'
  },
  brandManager: {
    email: 'manager@fitness_pro.com', 
    password: 'manager123456'
  }
};

class ApiTester {
  constructor() {
    this.tokens = {};
  }

  async login(userType, credentials) {
    try {
      console.log(`🔑 登录 ${userType}...`);
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
      
      this.tokens[userType] = response.data.access_token;
      console.log(`✅ ${userType} 登录成功`);
      console.log(`用户信息:`, response.data.user);
      return response.data;
    } catch (error) {
      console.error(`❌ ${userType} 登录失败:`, error.response?.data || error.message);
      throw error;
    }
  }

  async testBrandsAPI() {
    try {
      console.log('\n📊 测试品牌管理API...');
      
      const config = {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      };

      // 获取品牌列表
      const response = await axios.get(`${BASE_URL}/brands`, config);
      console.log('✅ 获取品牌列表成功:', response.data.data.length, '个品牌');
      
      if (response.data.data.length > 0) {
        const brand = response.data.data[0];
        
        // 获取品牌详情
        const detailResponse = await axios.get(`${BASE_URL}/brands/${brand.id}`, config);
        console.log('✅ 获取品牌详情成功:', detailResponse.data.name);
        
        // 获取品牌统计
        const statsResponse = await axios.get(`${BASE_URL}/brands/${brand.id}/stats`, config);
        console.log('✅ 获取品牌统计成功:', statsResponse.data);
      }
      
    } catch (error) {
      console.error('❌ 品牌API测试失败:', error.response?.data || error.message);
    }
  }

  async testStoresAPI() {
    try {
      console.log('\n🏪 测试门店管理API...');
      
      const config = {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      };

      // 获取门店列表
      const response = await axios.get(`${BASE_URL}/stores`, config);
      console.log('✅ 获取门店列表成功:', response.data.data.length, '个门店');
      
      if (response.data.data.length > 0) {
        const store = response.data.data[0];
        
        // 获取门店详情
        const detailResponse = await axios.get(`${BASE_URL}/stores/${store.id}`, config);
        console.log('✅ 获取门店详情成功:', detailResponse.data.name);
        
        // 获取门店统计
        const statsResponse = await axios.get(`${BASE_URL}/stores/${store.id}/stats`, config);
        console.log('✅ 获取门店统计成功:', statsResponse.data);
      }
      
    } catch (error) {
      console.error('❌ 门店API测试失败:', error.response?.data || error.message);
    }
  }

  async testUsersAPI() {
    try {
      console.log('\n👥 测试用户管理API...');
      
      const config = {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      };

      // 获取用户列表
      const response = await axios.get(`${BASE_URL}/users`, config);
      console.log('✅ 获取用户列表成功:', response.data.data.length, '个用户');
      
      if (response.data.data.length > 0) {
        const user = response.data.data[0];
        
        // 获取用户详情
        const detailResponse = await axios.get(`${BASE_URL}/users/${user.id}`, config);
        console.log('✅ 获取用户详情成功:', detailResponse.data.username);
      }
      
    } catch (error) {
      console.error('❌ 用户API测试失败:', error.response?.data || error.message);
    }
  }

  async testMembersAPI() {
    try {
      console.log('\n👤 测试会员管理API...');
      
      const config = {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      };

      // 获取会员列表
      const response = await axios.get(`${BASE_URL}/members`, config);
      console.log('✅ 获取会员列表成功:', response.data.data.length, '个会员');
      
      // 获取会员统计
      const statsResponse = await axios.get(`${BASE_URL}/members/stats`, config);
      console.log('✅ 获取会员统计成功:', statsResponse.data);
      
      if (response.data.data.length > 0) {
        const member = response.data.data[0];
        
        // 获取会员详情
        const detailResponse = await axios.get(`${BASE_URL}/members/${member.id}`, config);
        console.log('✅ 获取会员详情成功:', detailResponse.data.name);
      }
      
    } catch (error) {
      console.error('❌ 会员API测试失败:', error.response?.data || error.message);
    }
  }

  async testCoachesAPI() {
    try {
      console.log('\n🏋️ 测试教练管理API...');
      
      const config = {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      };

      // 获取教练列表
      const response = await axios.get(`${BASE_URL}/coaches`, config);
      console.log('✅ 获取教练列表成功:', response.data.data.length, '个教练');
      
      // 获取教练统计
      const statsResponse = await axios.get(`${BASE_URL}/coaches/stats`, config);
      console.log('✅ 获取教练统计成功:', statsResponse.data);
      
      if (response.data.data.length > 0) {
        const coach = response.data.data[0];
        
        // 获取教练详情
        const detailResponse = await axios.get(`${BASE_URL}/coaches/${coach.id}`, config);
        console.log('✅ 获取教练详情成功:', detailResponse.data.name);
      }
      
    } catch (error) {
      console.error('❌ 教练API测试失败:', error.response?.data || error.message);
    }
  }

  async testProfileAPI() {
    try {
      console.log('\n👤 测试用户资料API...');
      
      const config = {
        headers: { Authorization: `Bearer ${this.tokens.admin}` }
      };

      // 获取当前用户资料
      const response = await axios.get(`${BASE_URL}/auth/profile`, config);
      console.log('✅ 获取用户资料成功:', response.data.username);
      
    } catch (error) {
      console.error('❌ 用户资料API测试失败:', error.response?.data || error.message);
    }
  }

  async runTests() {
    console.log('🚀 开始API测试...\n');
    
    try {
      // 登录管理员
      await this.login('admin', testData.admin);
      
      // 测试各个API模块
      await this.testProfileAPI();
      await this.testBrandsAPI();
      await this.testStoresAPI();
      await this.testUsersAPI();
      await this.testMembersAPI();
      await this.testCoachesAPI();
      
      console.log('\n🎉 所有API测试完成！');
      
    } catch (error) {
      console.error('\n💥 API测试过程中出现错误:', error.message);
    }
  }
}

// 运行测试
const tester = new ApiTester();
tester.runTests();
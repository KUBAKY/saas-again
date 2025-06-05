const User = require('./src/models/User-sqlite');
const { initDatabase } = require('./src/config/database-sqlite');
require('dotenv').config();

async function testLogin() {
  try {
    console.log('初始化数据库连接...');
    await initDatabase();
    
    console.log('测试系统管理员登录...');
    
    // 测试查找用户
    const user = await User.findByPhone('13800000000');
    console.log('找到用户:', user ? {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      status: user.status
    } : '未找到');
    
    if (user) {
      // 测试密码验证
      const verifiedUser = await User.verifyPassword('13800000000', '123456');
      console.log('密码验证结果:', verifiedUser ? '成功' : '失败');
      
      if (verifiedUser) {
        console.log('验证成功的用户信息:', {
          id: verifiedUser.id,
          phone: verifiedUser.phone,
          name: verifiedUser.name,
          role: verifiedUser.role,
          status: verifiedUser.status
        });
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testLogin(); 
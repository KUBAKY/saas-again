#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');
const bcrypt = require('bcryptjs');

async function updateTestPasswords() {
  try {
    console.log('🔄 开始更新测试账号密码...\n');
    
    await initDatabase();
    
    // 测试账号列表
    const testAccounts = [
      { phone: '13800000000', role: '系统管理员' },
      { phone: '13800000001', role: '总经理' },
      { phone: '13800000002', role: '组长' },
      { phone: '13800000003', role: '销售员' }
    ];
    
    // 统一密码
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('更新测试账号密码为: 123456\n');
    
    for (const account of testAccounts) {
      try {
        const result = await query(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE phone = ?',
          [hashedPassword, account.phone]
        );
        
        if (result.changes > 0) {
          console.log(`✅ ${account.role} (${account.phone}) 密码更新成功`);
        } else {
          console.log(`⚠️  ${account.role} (${account.phone}) 用户不存在`);
        }
      } catch (error) {
        console.log(`❌ ${account.role} (${account.phone}) 密码更新失败:`, error.message);
      }
    }
    
    console.log('\n📋 更新后的测试账号信息:');
    console.log('手机号: 13800000000, 密码: 123456, 角色: 系统管理员');
    console.log('手机号: 13800000001, 密码: 123456, 角色: 总经理');
    console.log('手机号: 13800000002, 密码: 123456, 角色: 组长');
    console.log('手机号: 13800000003, 密码: 123456, 角色: 销售员');
    
    console.log('\n✅ 测试账号密码更新完成！');
    
  } catch (error) {
    console.error('❌ 更新密码失败:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  updateTestPasswords().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = updateTestPasswords; 
#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');
const bcrypt = require('bcryptjs');

async function fixTestAccounts() {
  try {
    console.log('🔄 开始修复测试账号...\n');
    
    await initDatabase();
    
    // 统一密码
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 1. 更新现有账号的角色和密码
    console.log('1. 更新现有测试账号...');
    
    // 更新系统管理员账号
    await query(`
      UPDATE users 
      SET role = 'admin', password = ?, name = '系统管理员', updated_at = CURRENT_TIMESTAMP 
      WHERE phone = '13800000000'
    `, [hashedPassword]);
    console.log('✅ 更新系统管理员账号 (13800000000)');
    
    // 更新总经理账号
    await query(`
      UPDATE users 
      SET role = 'manager', password = ?, name = '总经理', updated_at = CURRENT_TIMESTAMP 
      WHERE phone = '13800000001'
    `, [hashedPassword]);
    console.log('✅ 更新总经理账号 (13800000001)');
    
    // 更新组长账号
    await query(`
      UPDATE users 
      SET role = 'leader', password = ?, name = '组长', updated_at = CURRENT_TIMESTAMP 
      WHERE phone = '13800000002'
    `, [hashedPassword]);
    console.log('✅ 更新组长账号 (13800000002)');
    
    // 2. 检查并创建销售员账号
    console.log('\n2. 检查销售员账号...');
    
    const salesUser = await query('SELECT id FROM users WHERE phone = ?', ['13800000003']);
    
    if (salesUser.length === 0) {
      // 创建销售员账号
      await query(`
        INSERT INTO users (phone, password, name, role, join_date, status, created_at, updated_at)
        VALUES (?, ?, '销售员', 'sales', date('now'), 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, ['13800000003', hashedPassword]);
      console.log('✅ 创建销售员账号 (13800000003)');
    } else {
      // 更新销售员账号
      await query(`
        UPDATE users 
        SET role = 'sales', password = ?, name = '销售员', updated_at = CURRENT_TIMESTAMP 
        WHERE phone = '13800000003'
      `, [hashedPassword]);
      console.log('✅ 更新销售员账号 (13800000003)');
    }
    
    // 3. 验证更新结果
    console.log('\n3. 验证测试账号...');
    
    const testAccounts = await query(`
      SELECT phone, name, role 
      FROM users 
      WHERE phone IN ('13800000000', '13800000001', '13800000002', '13800000003')
      ORDER BY phone
    `);
    
    console.log('\n📋 测试账号信息:');
    testAccounts.forEach(account => {
      const roleMap = {
        'admin': '系统管理员',
        'manager': '总经理', 
        'leader': '组长',
        'sales': '销售员'
      };
      console.log(`手机号: ${account.phone}, 密码: 123456, 角色: ${roleMap[account.role]} (${account.role})`);
    });
    
    console.log('\n✅ 测试账号修复完成！');
    console.log('\n🎯 现在可以使用以下账号登录:');
    console.log('系统管理员: 13800000000 / 123456');
    console.log('总经理: 13800000001 / 123456');
    console.log('组长: 13800000002 / 123456');
    console.log('销售员: 13800000003 / 123456');
    
  } catch (error) {
    console.error('❌ 修复测试账号失败:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  fixTestAccounts().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = fixTestAccounts; 
#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');

async function updateUserRoles() {
  try {
    console.log('🔄 开始更新SQLite数据库用户角色枚举...\n');
    
    await initDatabase();
    
    // SQLite不支持直接修改CHECK约束，需要重建表
    console.log('1. 备份现有用户数据...');
    
    // 创建临时表
    await query(`
      CREATE TABLE users_backup AS 
      SELECT * FROM users
    `);
    console.log('✅ 用户数据备份完成');
    
    // 删除原表
    await query('DROP TABLE users');
    console.log('✅ 删除原用户表');
    
    // 创建新的用户表（包含admin角色）
    console.log('2. 创建新的用户表结构...');
    await query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone VARCHAR(11) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin','manager','leader','sales')),
        team_id INTEGER,
        join_date DATE NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME,
        FOREIGN KEY (team_id) REFERENCES teams(id)
      )
    `);
    console.log('✅ 新用户表创建完成');
    
    // 恢复数据
    console.log('3. 恢复用户数据...');
    await query(`
      INSERT INTO users (id, phone, password, name, role, team_id, join_date, status, created_at, updated_at, deleted_at)
      SELECT id, phone, password, name, role, team_id, join_date, status, created_at, updated_at, deleted_at
      FROM users_backup
    `);
    console.log('✅ 用户数据恢复完成');
    
    // 删除备份表
    await query('DROP TABLE users_backup');
    console.log('✅ 清理备份表');
    
    // 验证更新结果
    console.log('4. 验证角色枚举更新...');
    const testResult = await query(`
      SELECT sql FROM sqlite_master WHERE type='table' AND name='users'
    `);
    
    if (testResult[0].sql.includes("'admin'")) {
      console.log('✅ 角色枚举更新成功，现在支持: admin, manager, leader, sales');
    } else {
      console.log('❌ 角色枚举更新失败');
    }
    
    // 查看当前用户角色分布
    console.log('5. 查看当前用户角色分布...');
    const roleStats = await query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE deleted_at IS NULL 
      GROUP BY role
    `);
    
    console.log('角色分布:');
    roleStats.forEach(stat => {
      console.log(`  ${stat.role}: ${stat.count} 个用户`);
    });
    
    console.log('\n✅ SQLite数据库用户角色更新完成！');
    console.log('现在可以使用admin角色了');
    
  } catch (error) {
    console.error('❌ 更新用户角色失败:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  updateUserRoles().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = updateUserRoles; 
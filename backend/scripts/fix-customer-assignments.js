#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');

async function fixCustomerAssignments() {
  try {
    console.log('🔧 开始修复客户分配...');
    
    await initDatabase();
    
    // 获取所有新增的客户（ID > 60）
    const newCustomers = await query(`
      SELECT id, name, phone FROM customers 
      WHERE id > 60
      ORDER BY id
    `);
    
    console.log(`找到 ${newCustomers.length} 个新增的客户`);
    
    // 获取新团队的销售人员（8812系列团队）
    const newTeamSales = await query(`
      SELECT u.id, u.name, u.team_id, t.name as team_name
      FROM users u
      JOIN teams t ON u.team_id = t.id
      WHERE u.role IN ('sales', 'leader') 
      AND t.name LIKE '%8812%'
      AND u.deleted_at IS NULL
      ORDER BY u.id
    `);
    
    console.log(`找到 ${newTeamSales.length} 个新团队的销售人员`);
    
    // 获取所有没有分配销售员的客户
    const unassignedCustomers = await query(`
      SELECT id, name, phone FROM customers 
      WHERE owner_id IS NULL OR team_id IS NULL
      ORDER BY id DESC
      LIMIT 50
    `);
    
    console.log(`找到 ${unassignedCustomers.length} 个未分配的客户`);
    
    // 获取所有有团队的销售人员
    const salesWithTeams = await query(`
      SELECT u.id, u.name, u.team_id, t.name as team_name
      FROM users u
      JOIN teams t ON u.team_id = t.id
      WHERE u.role IN ('sales', 'leader') 
      AND u.team_id IS NOT NULL
      AND u.deleted_at IS NULL
      ORDER BY u.id
    `);
    
    console.log(`找到 ${salesWithTeams.length} 个有团队的销售人员`);
    
    if (newTeamSales.length === 0) {
      console.log('❌ 没有找到新团队的销售人员，无法重新分配客户');
      return;
    }
    
    // 重新分配新客户给新团队
    for (let i = 0; i < newCustomers.length; i++) {
      const customer = newCustomers[i];
      const sales = newTeamSales[i % newTeamSales.length]; // 循环分配
      
      await query(`
        UPDATE customers 
        SET owner_id = ?, team_id = ?
        WHERE id = ?
      `, [sales.id, sales.team_id, customer.id]);
      
      console.log(`✅ 重新分配客户: ${customer.name} -> ${sales.name} (${sales.team_name})`);
    }
    
    // 显示分配统计
    console.log('\n📊 客户分配统计:');
    const customerStats = await query(`
      SELECT 
        t.name as team_name,
        COUNT(c.id) as customer_count
      FROM teams t
      LEFT JOIN customers c ON t.id = c.team_id AND c.deleted_at IS NULL
      WHERE t.name LIKE '%销售组%'
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    
    customerStats.forEach(stat => {
      console.log(`${stat.team_name}: ${stat.customer_count} 个客户`);
    });
    
    console.log('\n✅ 客户分配修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

if (require.main === module) {
  fixCustomerAssignments();
}

module.exports = { fixCustomerAssignments }; 
#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');

async function createFollowRecords() {
  try {
    console.log('📝 开始为客户创建初始跟进记录...\n');
    
    await initDatabase();
    
    // 获取有销售员的客户
    const customersWithOwners = await query(`
      SELECT c.id, c.name, c.owner_id, u.name as owner_name
      FROM customers c
      JOIN users u ON c.owner_id = u.id
      WHERE c.deleted_at IS NULL AND c.owner_id IS NOT NULL
      LIMIT 50
    `);
    
    console.log(`找到 ${customersWithOwners.length} 个有销售员的客户`);
    
    const followContents = [
      '初次联系客户，了解基本需求',
      '客户表示有购买意向，需要详细方案',
      '发送产品资料，等待客户反馈',
      '客户咨询价格信息，正在准备报价',
      '约定下次沟通时间，继续跟进',
      '客户对产品很感兴趣，准备安排面谈',
      '已发送详细报价单，等待客户确认',
      '客户提出了一些技术问题，需要进一步解答',
      '客户要求提供案例参考，已整理相关资料',
      '与客户约定了下周的产品演示时间'
    ];
    
    let createdCount = 0;
    
    for (const customer of customersWithOwners) {
      // 检查是否已有跟进记录
      const existingRecords = await query(`
        SELECT id FROM follow_records WHERE customer_id = ?
      `, [customer.id]);
      
      if (existingRecords.length === 0) {
        const content = followContents[Math.floor(Math.random() * followContents.length)];
        const followTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        await query(`
          INSERT INTO follow_records (customer_id, sales_id, content, follow_time, created_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [customer.id, customer.owner_id, content, followTime]);
        
        console.log(`✅ 为客户 ${customer.name} 创建跟进记录: ${content}`);
        createdCount++;
      } else {
        console.log(`⏭️  客户 ${customer.name} 已有跟进记录，跳过`);
      }
    }
    
    // 统计跟进记录
    const totalRecords = await query(`
      SELECT COUNT(*) as count FROM follow_records
    `);
    
    console.log(`\n📊 跟进记录统计:`);
    console.log(`  新创建: ${createdCount} 条`);
    console.log(`  总计: ${totalRecords[0].count} 条`);
    
    console.log('\n✅ 跟进记录创建完成！');
    
  } catch (error) {
    console.error('❌ 创建跟进记录失败:', error);
  }
}

if (require.main === module) {
  createFollowRecords();
}

module.exports = { createFollowRecords }; 
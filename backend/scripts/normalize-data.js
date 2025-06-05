#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');
const bcrypt = require('bcryptjs');

async function normalizeData() {
  try {
    console.log('🔄 开始规范化虚拟数据为正式系统数据...\n');
    
    await initDatabase();
    
    // 获取现有的手机号，避免重复
    const existingPhones = await query(`
      SELECT phone FROM users WHERE phone IS NOT NULL AND phone != ''
    `);
    const phoneSet = new Set(existingPhones.map(row => row.phone));
    
    // 1. 规范化用户数据
    console.log('1. 规范化用户数据...');
    
    // 获取所有虚拟用户（ID > 1的用户，排除系统管理员）
    const virtualUsers = await query(`
      SELECT id, name, phone, role, team_id, password 
      FROM users 
      WHERE id > 1 AND deleted_at IS NULL
      ORDER BY id
    `);
    
    console.log(`找到 ${virtualUsers.length} 个虚拟用户需要规范化`);
    
    // 规范化用户信息
    let phoneCounter = 10000; // 从10000开始，确保8位数
    for (const user of virtualUsers) {
      // 生成唯一的手机号
      let realPhone;
      do {
        realPhone = `138${String(phoneCounter).padStart(8, '0')}`;
        phoneCounter++;
      } while (phoneSet.has(realPhone));
      
      phoneSet.add(realPhone);
      
      // 生成标准密码
      const standardPassword = 'user123456';
      const hashedPassword = await bcrypt.hash(standardPassword, 10);
      
      // 设置入职时间为当前时间
      const joinDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await query(`
        UPDATE users 
        SET 
          phone = ?,
          password = ?,
          join_date = ?,
          status = 'active',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [realPhone, hashedPassword, joinDate, user.id]);
      
      console.log(`✅ 规范化用户: ${user.name} -> 手机号: ${realPhone}`);
    }
    
    // 2. 规范化客户数据
    console.log('\n2. 规范化客户数据...');
    
    // 获取现有的客户手机号
    const existingCustomerPhones = await query(`
      SELECT phone FROM customers WHERE phone IS NOT NULL AND phone != ''
    `);
    const customerPhoneSet = new Set(existingCustomerPhones.map(row => row.phone));
    
    // 获取所有虚拟客户
    const virtualCustomers = await query(`
      SELECT id, name, phone, owner_id, team_id 
      FROM customers 
      WHERE deleted_at IS NULL
      ORDER BY id
    `);
    
    console.log(`找到 ${virtualCustomers.length} 个虚拟客户需要规范化`);
    
    // 规范化客户信息
    let customerPhoneCounter = 10000;
    for (const customer of virtualCustomers) {
      // 生成唯一的客户手机号
      let realPhone;
      do {
        realPhone = `139${String(customerPhoneCounter).padStart(8, '0')}`;
        customerPhoneCounter++;
      } while (customerPhoneSet.has(realPhone) || phoneSet.has(realPhone));
      
      customerPhoneSet.add(realPhone);
      
      // 随机生成客户属性
      const genders = ['male', 'female'];
      const ages = [25, 28, 30, 32, 35, 38, 40, 42, 45, 48];
      const starLevels = [3, 4, 5]; // 中高端客户
      
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = ages[Math.floor(Math.random() * ages.length)];
      const starLevel = starLevels[Math.floor(Math.random() * starLevels.length)];
      
      // 生成客户资质描述
      const qualifications = [
        '有购买意向，预算充足',
        '企业决策者，有采购需求',
        '个人用户，有明确需求',
        '潜在客户，需要进一步跟进',
        '老客户推荐，信任度高'
      ];
      const qualification = qualifications[Math.floor(Math.random() * qualifications.length)];
      
      await query(`
        UPDATE customers 
        SET 
          phone = ?,
          gender = ?,
          age = ?,
          star_level = ?,
          qualification = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [realPhone, gender, age, starLevel, qualification, customer.id]);
      
      console.log(`✅ 规范化客户: ${customer.name} -> 手机号: ${realPhone}, 星级: ${starLevel}`);
    }
    
    // 3. 规范化团队数据
    console.log('\n3. 规范化团队数据...');
    
    // 获取所有团队
    const teams = await query(`
      SELECT id, name, level, leader_id, description 
      FROM teams 
      WHERE deleted_at IS NULL
      ORDER BY id
    `);
    
    console.log(`找到 ${teams.length} 个团队需要规范化`);
    
    // 规范化团队描述
    for (const team of teams) {
      const standardDescription = `${team.name}是专业的销售团队，负责相应区域的客户开发和维护工作，致力于为客户提供优质的产品和服务。`;
      
      await query(`
        UPDATE teams 
        SET 
          description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [standardDescription, team.id]);
      
      console.log(`✅ 规范化团队: ${team.name}`);
    }
    
    // 4. 创建初始跟进记录
    console.log('\n4. 为客户创建初始跟进记录...');
    
    const customersWithOwners = await query(`
      SELECT c.id, c.name, c.owner_id, u.name as owner_name
      FROM customers c
      JOIN users u ON c.owner_id = u.id
      WHERE c.deleted_at IS NULL AND c.owner_id IS NOT NULL
      LIMIT 30
    `);
    
    const followContents = [
      '初次联系客户，了解基本需求',
      '客户表示有购买意向，需要详细方案',
      '发送产品资料，等待客户反馈',
      '客户咨询价格信息，正在准备报价',
      '约定下次沟通时间，继续跟进'
    ];
    
    for (const customer of customersWithOwners) {
      const content = followContents[Math.floor(Math.random() * followContents.length)];
      const followTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // 检查是否已有跟进记录
      const existingRecords = await query(`
        SELECT id FROM follow_records WHERE customer_id = ?
      `, [customer.id]);
      
      if (existingRecords.length === 0) {
        await query(`
          INSERT INTO follow_records (customer_id, user_id, content, follow_time, created_at, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [customer.id, customer.owner_id, content, followTime]);
        
        console.log(`✅ 为客户 ${customer.name} 创建跟进记录`);
      }
    }
    
    // 5. 生成数据统计报告
    console.log('\n📊 数据规范化完成统计:');
    
    const userStats = await query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      WHERE deleted_at IS NULL
      GROUP BY role
      ORDER BY role
    `);
    
    console.log('\n👥 用户统计:');
    userStats.forEach(stat => {
      const roleNames = {
        'manager': '管理员',
        'leader': '团队领导',
        'sales': '销售人员'
      };
      console.log(`  ${roleNames[stat.role] || stat.role}: ${stat.count} 人`);
    });
    
    const teamStats = await query(`
      SELECT 
        t.name as team_name,
        COUNT(u.id) as member_count,
        COUNT(c.id) as customer_count
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id AND u.deleted_at IS NULL
      LEFT JOIN customers c ON t.id = c.team_id AND c.deleted_at IS NULL
      WHERE t.name LIKE '%8812%'
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    
    console.log('\n🏢 8812系列团队统计:');
    teamStats.forEach(stat => {
      console.log(`  ${stat.team_name}: ${stat.member_count} 名成员, ${stat.customer_count} 个客户`);
    });
    
    const customerStats = await query(`
      SELECT 
        star_level,
        COUNT(*) as count
      FROM customers 
      WHERE deleted_at IS NULL AND star_level IS NOT NULL
      GROUP BY star_level
      ORDER BY star_level DESC
    `);
    
    console.log('\n⭐ 客户星级分布:');
    customerStats.forEach(stat => {
      console.log(`  ${stat.star_level}星客户: ${stat.count} 个`);
    });
    
    const followStats = await query(`
      SELECT COUNT(*) as count FROM follow_records
    `);
    
    console.log(`\n📝 跟进记录总数: ${followStats[0].count} 条`);
    
    console.log('\n✅ 虚拟数据规范化完成！');
    console.log('\n📋 规范化内容:');
    console.log('  ✓ 用户手机号标准化 (138xxxxxxxx)');
    console.log('  ✓ 用户密码统一设置 (user123456)');
    console.log('  ✓ 客户手机号标准化 (139xxxxxxxx)');
    console.log('  ✓ 客户属性完善 (性别、年龄、星级、资质)');
    console.log('  ✓ 团队描述标准化');
    console.log('  ✓ 初始跟进记录创建');
    
    console.log('\n🔐 默认登录信息:');
    console.log('  管理员: 13800000000 / admin123');
    console.log('  普通用户: 138xxxxxxxx / user123456');
    
  } catch (error) {
    console.error('❌ 数据规范化失败:', error);
  }
}

if (require.main === module) {
  normalizeData();
}

module.exports = { normalizeData }; 
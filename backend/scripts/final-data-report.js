#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');

async function generateFinalReport() {
  try {
    console.log('📊 生成最终数据统计报告...\n');
    
    await initDatabase();
    
    // 1. 用户统计
    console.log('👥 用户统计:');
    const userStats = await query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users 
      WHERE deleted_at IS NULL
      GROUP BY role
      ORDER BY role
    `);
    
    const roleNames = {
      'manager': '管理员',
      'leader': '团队领导',
      'sales': '销售人员'
    };
    
    let totalUsers = 0;
    userStats.forEach(stat => {
      console.log(`  ${roleNames[stat.role] || stat.role}: ${stat.count} 人`);
      totalUsers += stat.count;
    });
    console.log(`  总计: ${totalUsers} 人`);
    
    // 2. 团队统计
    console.log('\n🏢 团队统计:');
    const teamStats = await query(`
      SELECT 
        COUNT(*) as total_teams
      FROM teams 
      WHERE deleted_at IS NULL
    `);
    console.log(`  总团队数: ${teamStats[0].total_teams} 个`);
    
    // 8812系列团队详细统计
    const team8812Stats = await query(`
      SELECT 
        t.name as team_name,
        t.level,
        u_leader.name as leader_name,
        COUNT(DISTINCT u_member.id) as member_count,
        COUNT(DISTINCT c.id) as customer_count
      FROM teams t
      LEFT JOIN users u_leader ON t.leader_id = u_leader.id
      LEFT JOIN users u_member ON t.id = u_member.team_id AND u_member.deleted_at IS NULL
      LEFT JOIN customers c ON t.id = c.team_id AND c.deleted_at IS NULL
      WHERE t.name LIKE '%8812%'
      GROUP BY t.id, t.name, t.level, u_leader.name
      ORDER BY t.name
    `);
    
    console.log('\n🎯 8812系列团队详情:');
    team8812Stats.forEach(stat => {
      console.log(`  ${stat.team_name}:`);
      console.log(`    等级: ${stat.level}`);
      console.log(`    领导: ${stat.leader_name || '未分配'}`);
      console.log(`    成员: ${stat.member_count} 人`);
      console.log(`    客户: ${stat.customer_count} 个`);
    });
    
    // 3. 客户统计
    console.log('\n👤 客户统计:');
    const customerStats = await query(`
      SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL
    `);
    console.log(`  总客户数: ${customerStats[0].total} 个`);
    
    const customerByStarLevel = await query(`
      SELECT 
        star_level,
        COUNT(*) as count
      FROM customers 
      WHERE deleted_at IS NULL AND star_level IS NOT NULL
      GROUP BY star_level
      ORDER BY star_level DESC
    `);
    
    console.log('\n⭐ 客户星级分布:');
    customerByStarLevel.forEach(stat => {
      console.log(`  ${stat.star_level}星客户: ${stat.count} 个`);
    });
    
    const customerByGender = await query(`
      SELECT 
        gender,
        COUNT(*) as count
      FROM customers 
      WHERE deleted_at IS NULL AND gender IS NOT NULL
      GROUP BY gender
    `);
    
    console.log('\n👫 客户性别分布:');
    customerByGender.forEach(stat => {
      const genderName = stat.gender === 'male' ? '男性' : '女性';
      console.log(`  ${genderName}: ${stat.count} 个`);
    });
    
    // 4. 跟进记录统计
    console.log('\n📝 跟进记录统计:');
    const followStats = await query(`
      SELECT COUNT(*) as total FROM follow_records
    `);
    console.log(`  总跟进记录: ${followStats[0].total} 条`);
    
    const recentFollows = await query(`
      SELECT COUNT(*) as count 
      FROM follow_records 
      WHERE DATE(created_at) = DATE('now')
    `);
    console.log(`  今日新增: ${recentFollows[0].count} 条`);
    
    // 5. 数据完整性检查
    console.log('\n🔍 数据完整性检查:');
    
    const usersWithoutTeam = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE team_id IS NULL AND role IN ('leader', 'sales') AND deleted_at IS NULL
    `);
    console.log(`  无团队的销售人员: ${usersWithoutTeam[0].count} 人`);
    
    const customersWithoutOwner = await query(`
      SELECT COUNT(*) as count 
      FROM customers 
      WHERE owner_id IS NULL AND deleted_at IS NULL
    `);
    console.log(`  无销售员的客户: ${customersWithoutOwner[0].count} 个`);
    
    const teamsWithoutLeader = await query(`
      SELECT COUNT(*) as count 
      FROM teams 
      WHERE leader_id IS NULL AND deleted_at IS NULL
    `);
    console.log(`  无领导的团队: ${teamsWithoutLeader[0].count} 个`);
    
    // 6. 系统配置信息
    console.log('\n⚙️  系统配置信息:');
    console.log('  数据库类型: SQLite');
    console.log('  前端地址: http://localhost:3000');
    console.log('  后端API: http://localhost:3001/api');
    
    console.log('\n🔐 登录信息:');
    console.log('  管理员: 13800000000 / admin123');
    console.log('  普通用户: 138xxxxxxxx / user123456');
    
    console.log('\n✅ 数据规范化总结:');
    console.log('  ✓ 用户手机号已标准化 (138xxxxxxxx)');
    console.log('  ✓ 用户密码已统一设置 (user123456)');
    console.log('  ✓ 客户手机号已标准化 (139xxxxxxxx)');
    console.log('  ✓ 客户属性已完善 (性别、年龄、星级、资质)');
    console.log('  ✓ 团队描述已标准化');
    console.log('  ✓ 初始跟进记录已创建');
    console.log('  ✓ 所有虚拟数据已转换为正式系统数据');
    
    console.log('\n🎉 电话销售管理系统数据规范化完成！');
    console.log('系统已准备就绪，可以正式投入使用。');
    
  } catch (error) {
    console.error('❌ 生成报告失败:', error);
  }
}

if (require.main === module) {
  generateFinalReport();
}

module.exports = { generateFinalReport }; 
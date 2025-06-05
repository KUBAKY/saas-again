const { query, initDatabase } = require('./backend/src/config/database-sqlite');

async function fixTeamLeaderConstraint() {
  console.log('🔧 开始修复团队组长限制问题...');
  
  try {
    // 初始化数据库连接
    await initDatabase();
    console.log('✅ 数据库连接初始化成功');
    
    // 1. 查找所有有多个组长的团队
    const teamsWithMultipleLeaders = await query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        COUNT(u.id) as leader_count
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id AND u.role = 'leader' AND u.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
      GROUP BY t.id, t.name
      HAVING COUNT(u.id) > 1
    `);
    
    console.log(`📊 发现 ${teamsWithMultipleLeaders.length} 个团队有多个组长`);
    
    for (const team of teamsWithMultipleLeaders) {
      console.log(`\n🔍 处理团队: ${team.team_name} (ID: ${team.team_id}), 组长数量: ${team.leader_count}`);
      
      // 获取该团队的所有组长
      const leaders = await query(`
        SELECT id, name, phone, created_at
        FROM users 
        WHERE team_id = ? AND role = 'leader' AND deleted_at IS NULL
        ORDER BY created_at ASC
      `, [team.team_id]);
      
      console.log('📋 团队组长列表:');
      leaders.forEach((leader, index) => {
        console.log(`  ${index + 1}. ${leader.name} (${leader.phone}) - 创建时间: ${leader.created_at}`);
      });
      
      // 保留第一个组长（最早创建的），其他的改为销售员
      const keepLeader = leaders[0];
      const changeToSales = leaders.slice(1);
      
      console.log(`✅ 保留组长: ${keepLeader.name}`);
      console.log(`🔄 将以下用户改为销售员:`);
      
      for (const user of changeToSales) {
        console.log(`  - ${user.name} (${user.phone})`);
        
        // 将角色改为销售员
        await query(`
          UPDATE users 
          SET role = 'sales', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [user.id]);
      }
      
      // 确保团队的leader_id指向正确的组长
      await query(`
        UPDATE teams 
        SET leader_id = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [keepLeader.id, team.team_id]);
      
      console.log(`✅ 团队 ${team.team_name} 修复完成`);
    }
    
    // 2. 查找没有组长的团队
    const teamsWithoutLeader = await query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.leader_id,
        COUNT(u.id) as member_count
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id AND u.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
      AND (
        t.leader_id IS NULL 
        OR NOT EXISTS (
          SELECT 1 FROM users 
          WHERE id = t.leader_id AND role = 'leader' AND deleted_at IS NULL
        )
      )
      GROUP BY t.id, t.name, t.leader_id
      HAVING COUNT(u.id) > 0
    `);
    
    console.log(`\n📊 发现 ${teamsWithoutLeader.length} 个团队没有有效组长`);
    
    for (const team of teamsWithoutLeader) {
      console.log(`\n🔍 处理无组长团队: ${team.team_name} (ID: ${team.team_id})`);
      
      // 获取该团队的第一个成员，将其设为组长
      const firstMember = await query(`
        SELECT id, name, phone
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL
        ORDER BY created_at ASC
        LIMIT 1
      `, [team.team_id]);
      
      if (firstMember.length > 0) {
        const newLeader = firstMember[0];
        console.log(`👑 将 ${newLeader.name} 设为组长`);
        
        // 将用户角色改为组长
        await query(`
          UPDATE users 
          SET role = 'leader', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [newLeader.id]);
        
        // 更新团队的leader_id
        await query(`
          UPDATE teams 
          SET leader_id = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [newLeader.id, team.team_id]);
        
        console.log(`✅ 团队 ${team.team_name} 组长设置完成`);
      }
    }
    
    // 3. 验证修复结果
    console.log('\n🔍 验证修复结果...');
    
    const finalCheck = await query(`
      SELECT 
        t.id as team_id,
        t.name as team_name,
        t.leader_id,
        COUNT(CASE WHEN u.role = 'leader' THEN 1 END) as leader_count,
        COUNT(u.id) as total_members
      FROM teams t
      LEFT JOIN users u ON t.id = u.team_id AND u.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
      GROUP BY t.id, t.name, t.leader_id
      ORDER BY t.id
    `);
    
    console.log('\n📊 最终团队状态:');
    console.log('团队ID | 团队名称 | 组长ID | 组长数量 | 总成员数');
    console.log('-------|----------|--------|----------|----------');
    
    let hasIssues = false;
    for (const team of finalCheck) {
      const status = team.leader_count === 1 ? '✅' : (team.leader_count === 0 ? '⚠️' : '❌');
      console.log(`${team.team_id.toString().padEnd(6)} | ${team.team_name.padEnd(8)} | ${(team.leader_id || 'NULL').toString().padEnd(6)} | ${team.leader_count.toString().padEnd(8)} | ${team.total_members.toString().padEnd(8)} ${status}`);
      
      if (team.leader_count !== 1 && team.total_members > 0) {
        hasIssues = true;
      }
    }
    
    if (hasIssues) {
      console.log('\n❌ 仍有团队存在组长问题，请手动检查');
    } else {
      console.log('\n✅ 所有团队组长限制修复完成！');
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  }
}

// 运行修复脚本
if (require.main === module) {
  fixTeamLeaderConstraint().then(() => {
    console.log('\n🎉 修复脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { fixTeamLeaderConstraint }; 
#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');

async function fixTeamLeaderConsistency() {
  console.log('🔧 开始修复团队组长数据一致性...\n');
  
  try {
    // 初始化数据库连接
    await initDatabase();
    
    // 1. 获取所有用户的实际分配情况
    console.log('1. 检查用户分配情况...');
    const users = await query(`
      SELECT id, name, role, team_id 
      FROM users 
      WHERE deleted_at IS NULL AND role = 'leader'
      ORDER BY id
    `);
    
    console.log('组长用户分配情况：');
    users.forEach(user => {
      console.log(`  - ${user.name} (ID: ${user.id}) -> 团队ID: ${user.team_id || '未分配'}`);
    });
    
    // 2. 获取所有团队的组长设置
    console.log('\n2. 检查团队组长设置...');
    const teams = await query(`
      SELECT t.id, t.name, t.leader_id, u.name as leader_name
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.deleted_at IS NULL
      ORDER BY t.id
    `);
    
    console.log('团队组长设置：');
    teams.forEach(team => {
      console.log(`  - ${team.name} (ID: ${team.id}) -> 组长ID: ${team.leader_id || '未设置'} (${team.leader_name || '无'})`);
    });
    
    // 3. 修复数据一致性
    console.log('\n3. 修复数据一致性...');
    
    // 根据用户的team_id来修正团队的leader_id
    for (const user of users) {
      if (user.team_id) {
        // 检查该团队的当前组长设置
        const currentTeam = teams.find(t => t.id === user.team_id);
        if (currentTeam && currentTeam.leader_id !== user.id) {
          console.log(`  修复: 将团队"${currentTeam.name}"的组长设置为"${user.name}"`);
          await query(
            'UPDATE teams SET leader_id = ? WHERE id = ?',
            [user.id, user.team_id]
          );
        }
      }
    }
    
    // 4. 清理重复的组长分配
    console.log('\n4. 清理重复的组长分配...');
    
    // 获取每个组长被分配到的团队数量
    const leaderTeamCounts = await query(`
      SELECT leader_id, COUNT(*) as team_count, GROUP_CONCAT(name) as team_names
      FROM teams 
      WHERE leader_id IS NOT NULL AND deleted_at IS NULL
      GROUP BY leader_id
      HAVING team_count > 1
    `);
    
    for (const leaderCount of leaderTeamCounts) {
      console.log(`  发现重复分配: 组长ID ${leaderCount.leader_id} 被分配到 ${leaderCount.team_count} 个团队: ${leaderCount.team_names}`);
      
      // 获取该组长实际所在的团队
      const leaderUser = await query(
        'SELECT team_id FROM users WHERE id = ? AND deleted_at IS NULL',
        [leaderCount.leader_id]
      );
      
      if (leaderUser.length > 0 && leaderUser[0].team_id) {
        const actualTeamId = leaderUser[0].team_id;
        console.log(`    保留团队ID ${actualTeamId}，清理其他团队的组长设置`);
        
        // 清理其他团队的组长设置
        await query(
          'UPDATE teams SET leader_id = NULL WHERE leader_id = ? AND id != ?',
          [leaderCount.leader_id, actualTeamId]
        );
      }
    }
    
    // 5. 重新计算所有团队的成员数量
    console.log('\n5. 重新计算团队成员数量...');
    
    const allTeams = await query(`
      SELECT id, name FROM teams WHERE deleted_at IS NULL
    `);
    
    for (const team of allTeams) {
      const memberCount = await query(
        'SELECT COUNT(*) as count FROM users WHERE team_id = ? AND deleted_at IS NULL',
        [team.id]
      );
      
      const count = memberCount[0].count;
      await query(
        'UPDATE teams SET member_count = ? WHERE id = ?',
        [count, team.id]
      );
      
      console.log(`  团队"${team.name}": ${count}个成员`);
    }
    
    // 6. 验证修复结果
    console.log('\n6. 验证修复结果...');
    
    const finalTeams = await query(`
      SELECT t.id, t.name, t.leader_id, t.member_count, u.name as leader_name
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
      WHERE t.deleted_at IS NULL
      ORDER BY t.id
    `);
    
    console.log('修复后的团队状态：');
    finalTeams.forEach(team => {
      console.log(`  - ${team.name}: 组长=${team.leader_name || '未设置'}, 成员数=${team.member_count}`);
    });
    
    console.log('\n✅ 团队组长数据一致性修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixTeamLeaderConsistency()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { fixTeamLeaderConsistency }; 
#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');

async function fixTeamAssignments() {
  try {
    console.log('🔧 开始修复团队分配...');
    
    await initDatabase();
    
    // 获取所有新增的团队（包含时间戳的团队）
    const newTeams = await query(`
      SELECT id, name FROM teams 
      WHERE name LIKE '%销售组%' AND (
        name LIKE '%7091' OR 
        name LIKE '%1534' OR 
        name LIKE '%4830' OR 
        name LIKE '%3424' OR 
        name LIKE '%8812'
      )
      ORDER BY id
    `);
    
    console.log(`找到 ${newTeams.length} 个新团队`);
    
    // 获取所有新增的组长（最近添加的5个组长）
    const newLeaders = await query(`
      SELECT id, name, phone FROM users 
      WHERE role = 'leader' 
      AND (team_id IS NULL OR team_id = '')
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log(`找到 ${newLeaders.length} 个未分配的组长`);
    
    // 获取所有新增的销售员（最近添加的15个销售员）
    const newSales = await query(`
      SELECT id, name, phone FROM users 
      WHERE role = 'sales' 
      AND (team_id IS NULL OR team_id = '')
      ORDER BY id DESC 
      LIMIT 15
    `);
    
    console.log(`找到 ${newSales.length} 个未分配的销售员`);
    
    // 为每个团队分配组长和成员
    for (let i = 0; i < Math.min(newTeams.length, newLeaders.length); i++) {
      const team = newTeams[i];
      const leader = newLeaders[i];
      
      // 设置团队组长
      await query(`
        UPDATE teams SET leader_id = ? WHERE id = ?
      `, [leader.id, team.id]);
      
      // 设置组长的团队
      await query(`
        UPDATE users SET team_id = ? WHERE id = ?
      `, [team.id, leader.id]);
      
      console.log(`✅ 分配组长: ${leader.name} -> ${team.name}`);
      
      // 为每个团队分配3个销售员
      const startIndex = i * 3;
      const endIndex = Math.min(startIndex + 3, newSales.length);
      
      for (let j = startIndex; j < endIndex; j++) {
        const sales = newSales[j];
        await query(`
          UPDATE users SET team_id = ? WHERE id = ?
        `, [team.id, sales.id]);
        
        console.log(`  ✅ 分配销售员: ${sales.name} -> ${team.name}`);
      }
    }
    
    // 重新计算团队成员数量
    console.log('\\n🔄 重新计算团队成员数量...');
    const teams = await query('SELECT id FROM teams');
    
    for (const team of teams) {
      const memberCount = await query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL
      `, [team.id]);
      
      await query(`
        UPDATE teams 
        SET member_count = ? 
        WHERE id = ?
      `, [memberCount[0].count, team.id]);
    }
    
    // 显示最终统计
    console.log('\\n📊 团队分配统计:');
    const teamStats = await query(`
      SELECT 
        t.id,
        t.name,
        u_leader.name as leader_name,
        t.member_count,
        t.max_members
      FROM teams t
      LEFT JOIN users u_leader ON t.leader_id = u_leader.id
      WHERE t.name LIKE '%销售组%'
      ORDER BY t.id
    `);
    
    teamStats.forEach(team => {
      console.log(`${team.name}: 组长=${team.leader_name || '无'}, 成员=${team.member_count}/${team.max_members}`);
    });
    
    console.log('\\n✅ 团队分配修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

if (require.main === module) {
  fixTeamAssignments();
}

module.exports = { fixTeamAssignments }; 
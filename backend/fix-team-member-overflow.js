const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tscrm.db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
    db.close();
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
    db.close();
  });
}

async function fixTeamMemberOverflow() {
  try {
    console.log('🔍 检查团队人数超限情况...\n');
    
    // 1. 获取所有团队信息
    const teams = await query(`
      SELECT id, name, level, member_count, max_members, leader_id
      FROM teams 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    console.log('团队状态检查:');
    const overflowTeams = [];
    
    teams.forEach(team => {
      const status = team.member_count > team.max_members ? '🔴 超限' : 
                    team.member_count === team.max_members ? '🟡 已满' : '🟢 正常';
      console.log(`- ${team.name}: ${team.member_count}/${team.max_members} ${status}`);
      
      if (team.member_count > team.max_members) {
        overflowTeams.push(team);
      }
    });
    
    if (overflowTeams.length === 0) {
      console.log('\n✅ 没有发现人数超限的团队');
      return;
    }
    
    console.log(`\n⚠️  发现 ${overflowTeams.length} 个团队人数超限，开始修复...\n`);
    
    for (const team of overflowTeams) {
      console.log(`🔧 修复团队: ${team.name}`);
      console.log(`   当前人数: ${team.member_count}, 最大限制: ${team.max_members}`);
      
      // 获取该团队的所有成员
      const members = await query(`
        SELECT id, name, role, join_date
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL
        ORDER BY 
          CASE WHEN role = 'leader' THEN 0 ELSE 1 END,
          join_date ASC
      `, [team.id]);
      
      console.log(`   团队成员 (${members.length}人):`);
      members.forEach((member, index) => {
        const isLeader = member.role === 'leader' || member.id === team.leader_id;
        console.log(`     ${index + 1}. ${member.name} (${member.role}) ${isLeader ? '👑' : ''}`);
      });
      
      // 计算需要移除的人数
      const excessCount = team.member_count - team.max_members;
      console.log(`   需要移除: ${excessCount} 人`);
      
      // 选择要移除的成员（保留组长，按入职时间倒序移除普通成员）
      const membersToRemove = members
        .filter(member => member.role !== 'leader' && member.id !== team.leader_id)
        .slice(-excessCount); // 移除最后加入的成员
      
      if (membersToRemove.length < excessCount) {
        console.log(`   ⚠️  警告: 只能移除 ${membersToRemove.length} 个普通成员，无法完全解决超限问题`);
      }
      
      console.log(`   将移除以下成员:`);
      membersToRemove.forEach(member => {
        console.log(`     - ${member.name} (${member.role})`);
      });
      
      // 执行移除操作
      for (const member of membersToRemove) {
        await run(
          'UPDATE users SET team_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [member.id]
        );
        console.log(`     ✅ 已移除 ${member.name}`);
      }
      
      // 更新团队成员数量
      const newMemberCount = team.member_count - membersToRemove.length;
      await run(
        'UPDATE teams SET member_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newMemberCount, team.id]
      );
      
      console.log(`   ✅ 团队 "${team.name}" 修复完成: ${newMemberCount}/${team.max_members}\n`);
    }
    
    // 2. 重新检查所有团队状态
    console.log('📊 修复后的团队状态:');
    const updatedTeams = await query(`
      SELECT id, name, level, member_count, max_members
      FROM teams 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    let allFixed = true;
    updatedTeams.forEach(team => {
      const status = team.member_count > team.max_members ? '🔴 超限' : 
                    team.member_count === team.max_members ? '🟡 已满' : '🟢 正常';
      console.log(`- ${team.name}: ${team.member_count}/${team.max_members} ${status}`);
      
      if (team.member_count > team.max_members) {
        allFixed = false;
      }
    });
    
    if (allFixed) {
      console.log('\n🎉 所有团队人数限制问题已修复！');
    } else {
      console.log('\n⚠️  仍有团队存在人数超限问题，可能需要手动处理');
    }
    
    // 3. 显示被移除的用户列表
    const unassignedUsers = await query(`
      SELECT id, name, role, phone
      FROM users 
      WHERE team_id IS NULL AND deleted_at IS NULL AND role != 'manager'
      ORDER BY name
    `);
    
    if (unassignedUsers.length > 0) {
      console.log(`\n👥 当前未分配团队的用户 (${unassignedUsers.length}人):`);
      unassignedUsers.forEach(user => {
        console.log(`- ${user.name} (${user.role}) - ${user.phone}`);
      });
      console.log('\n💡 建议: 可以将这些用户重新分配到有空位的团队中');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  }
}

fixTeamMemberOverflow(); 
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

async function checkTeamStatus() {
  try {
    console.log('🔍 检查华中销售组7091的详细状态...\n');
    
    // 1. 获取团队信息
    const teams = await query(`
      SELECT id, name, level, member_count, max_members, leader_id
      FROM teams 
      WHERE name = '华中销售组7091' AND deleted_at IS NULL
    `);
    
    if (teams.length === 0) {
      console.log('❌ 没有找到华中销售组7091');
      return;
    }
    
    const team = teams[0];
    console.log('📊 团队信息:');
    console.log(`- ID: ${team.id}`);
    console.log(`- 名称: ${team.name}`);
    console.log(`- 等级: ${team.level}`);
    console.log(`- 记录的成员数: ${team.member_count}`);
    console.log(`- 最大成员数: ${team.max_members}`);
    console.log(`- 组长ID: ${team.leader_id}`);
    
    // 2. 获取实际的团队成员
    const members = await query(`
      SELECT id, name, role, phone, join_date
      FROM users 
      WHERE team_id = ? AND deleted_at IS NULL
      ORDER BY role, name
    `, [team.id]);
    
    console.log(`\n👥 实际团队成员 (${members.length}人):`);
    members.forEach((member, index) => {
      const isLeader = member.role === 'leader' || member.id === team.leader_id;
      console.log(`  ${index + 1}. ${member.name} (${member.role}) - ${member.phone} ${isLeader ? '👑' : ''}`);
    });
    
    // 3. 检查数据一致性
    console.log('\n🔍 数据一致性检查:');
    if (team.member_count === members.length) {
      console.log('✅ 团队成员数量记录正确');
    } else {
      console.log(`❌ 团队成员数量不一致！记录: ${team.member_count}, 实际: ${members.length}`);
    }
    
    if (members.length >= team.max_members) {
      console.log('🔴 团队已满，应该拒绝新成员加入');
    } else {
      console.log(`🟢 团队有空位，还可以添加 ${team.max_members - members.length} 人`);
    }
    
    // 4. 检查最近创建的用户
    console.log('\n📝 最近创建的用户:');
    const recentUsers = await query(`
      SELECT id, name, role, phone, team_id, created_at
      FROM users 
      WHERE created_at > datetime('now', '-1 hour') AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    recentUsers.forEach(user => {
      console.log(`- ${user.name} (${user.role}) - 团队ID: ${user.team_id || '无'} - 创建时间: ${user.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkTeamStatus(); 
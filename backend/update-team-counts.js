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

async function updateTeamCounts() {
  try {
    console.log('🔄 更新所有团队的成员数量...\n');
    
    // 1. 获取所有团队
    const teams = await query(`
      SELECT id, name, member_count
      FROM teams 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    console.log(`找到 ${teams.length} 个团队\n`);
    
    // 2. 为每个团队计算实际成员数量并更新
    for (const team of teams) {
      // 计算实际成员数量
      const memberCountResult = await query(`
        SELECT COUNT(*) as actual_count
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL
      `, [team.id]);
      
      const actualCount = memberCountResult[0].actual_count;
      
      console.log(`团队: ${team.name}`);
      console.log(`  记录的成员数: ${team.member_count}`);
      console.log(`  实际成员数: ${actualCount}`);
      
      if (team.member_count !== actualCount) {
        // 更新成员数量
        await run(`
          UPDATE teams 
          SET member_count = ?
          WHERE id = ?
        `, [actualCount, team.id]);
        
        console.log(`  ✅ 已更新: ${team.member_count} → ${actualCount}`);
      } else {
        console.log(`  ✅ 数量正确`);
      }
      console.log('');
    }
    
    console.log('🎉 所有团队成员数量更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  }
}

updateTeamCounts(); 
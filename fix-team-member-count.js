const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
const path = require('path');

// 数据库连接
const dbPath = path.join(__dirname, 'backend/data/tscrm.db');
const db = new sqlite3.Database(dbPath);

// Promise化查询函数
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

async function fixTeamMemberCount() {
  try {
    console.log('🔧 开始修复团队成员数量统计...\n');
    
    // 获取所有团队
    const teams = await query('SELECT id, name, member_count FROM teams WHERE deleted_at IS NULL');
    
    console.log(`📊 发现 ${teams.length} 个团队需要检查\n`);
    
    for (const team of teams) {
      // 计算实际成员数量
      const actualCount = await query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL
      `, [team.id]);
      
      // 计算销售员数量
      const salesCount = await query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL AND role = 'sales'
      `, [team.id]);
      
      // 计算组长数量
      const leaderCount = await query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL AND role = 'leader'
      `, [team.id]);
      
      const currentCount = team.member_count;
      const correctCount = actualCount[0].count;
      const sales = salesCount[0].count;
      const leaders = leaderCount[0].count;
      
      console.log(`团队: ${team.name} (ID: ${team.id})`);
      console.log(`  当前记录: ${currentCount} 人`);
      console.log(`  实际成员: ${correctCount} 人 (${sales}销售员 + ${leaders}组长)`);
      
      if (currentCount !== correctCount) {
        console.log(`  ❌ 数据不一致，需要修复`);
        
        // 更新团队成员数量
        await run(`
          UPDATE teams 
          SET member_count = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [correctCount, team.id]);
        
        console.log(`  ✅ 已修复: ${currentCount} → ${correctCount}`);
      } else {
        console.log(`  ✅ 数据正确`);
      }
      console.log('');
    }
    
    console.log('🎉 团队成员数量修复完成！\n');
    
    // 验证修复结果
    console.log('📋 修复后的团队统计:');
    const updatedTeams = await query(`
      SELECT 
        t.id,
        t.name,
        t.member_count,
        t.max_members,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL) as actual_count,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'sales') as sales_count,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL AND role = 'leader') as leader_count
      FROM teams t 
      WHERE t.deleted_at IS NULL
      ORDER BY t.id
    `);
    
    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ 团队名称                │ 记录数量 │ 实际数量 │ 销售员 │ 组长 │ 状态     │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    
    let allCorrect = true;
    for (const team of updatedTeams) {
      const isCorrect = team.member_count === team.actual_count;
      if (!isCorrect) allCorrect = false;
      
      const status = isCorrect ? '✅ 正确' : '❌ 错误';
      const teamName = team.name.padEnd(20);
      
      console.log(`│ ${teamName} │ ${team.member_count.toString().padStart(6)} │ ${team.actual_count.toString().padStart(6)} │ ${team.sales_count.toString().padStart(4)} │ ${team.leader_count.toString().padStart(2)} │ ${status} │`);
    }
    
    console.log('└─────────────────────────────────────────────────────────────────────────────┘');
    
    if (allCorrect) {
      console.log('\n🎉 所有团队的成员数量统计都已正确！');
    } else {
      console.log('\n⚠️  仍有团队数据不一致，请检查数据库');
    }
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
  } finally {
    db.close();
  }
}

// 执行修复
fixTeamMemberCount(); 
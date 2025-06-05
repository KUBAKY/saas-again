const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库连接
const dbPath = path.join(__dirname, '../data/tscrm.db');
const db = new sqlite3.Database(dbPath);

// 修复团队成员数量
async function fixTeamMemberCount() {
  return new Promise((resolve, reject) => {
    console.log('开始修复团队成员数量...');
    
    // 更新所有团队的成员数量
    const sql = `
      UPDATE teams 
      SET member_count = (
        SELECT COUNT(*) 
        FROM users 
        WHERE users.team_id = teams.id 
        AND users.deleted_at IS NULL
      )
      WHERE teams.deleted_at IS NULL
    `;
    
    db.run(sql, function(err) {
      if (err) {
        console.error('修复失败:', err);
        reject(err);
      } else {
        console.log(`修复完成，影响 ${this.changes} 个团队`);
        
        // 查询修复后的结果
        db.all(`
          SELECT 
            t.id,
            t.name,
            t.member_count,
            (SELECT COUNT(*) FROM users WHERE team_id = t.id AND deleted_at IS NULL) as actual_count
          FROM teams t 
          WHERE t.deleted_at IS NULL
          ORDER BY t.id
        `, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            console.log('\n团队成员数量统计:');
            console.log('ID\t团队名称\t\t记录数量\t实际数量');
            console.log('----------------------------------------');
            rows.forEach(row => {
              console.log(`${row.id}\t${row.name}\t\t${row.member_count}\t${row.actual_count}`);
            });
            resolve();
          }
        });
      }
    });
  });
}

// 执行修复
fixTeamMemberCount()
  .then(() => {
    console.log('\n修复完成！');
    db.close();
  })
  .catch(err => {
    console.error('修复失败:', err);
    db.close();
    process.exit(1);
  }); 
const { initDatabase, query, run, closeDatabase } = require('./src/config/database-sqlite');

async function fixTeamSalesLimit() {
  try {
    console.log('🔧 开始修复小组等级限制逻辑...\n');
    
    // 初始化数据库连接
    await initDatabase();
    
    // 1. 获取所有团队信息
    const teams = await query(`
      SELECT id, name, level, max_members, member_count, leader_id
      FROM teams 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    console.log(`找到 ${teams.length} 个团队\n`);
    
    // 2. 检查每个团队的销售员数量是否超过限制
    console.log('📊 团队销售员数量检查:');
    const problemTeams = [];
    
    for (const team of teams) {
      // 计算实际的销售员数量
      const salesCount = await query(`
        SELECT COUNT(*) as count
        FROM users 
        WHERE team_id = ? AND role = 'sales' AND deleted_at IS NULL
      `, [team.id]);
      
      // 计算总成员数量
      const totalCount = await query(`
        SELECT COUNT(*) as count
        FROM users 
        WHERE team_id = ? AND deleted_at IS NULL
      `, [team.id]);
      
      const actualSalesCount = salesCount[0].count;
      const actualTotalCount = totalCount[0].count;
      
      console.log(`- ${team.name}:`);
      console.log(`  等级限制: ${team.max_members}名销售员`);
      console.log(`  当前销售员: ${actualSalesCount}名`);
      console.log(`  总成员数: ${actualTotalCount}名`);
      console.log(`  记录的成员数: ${team.member_count}名`);
      
      // 检查销售员数量是否超限
      if (actualSalesCount > team.max_members) {
        console.log(`  🔴 销售员数量超限！需要处理`);
        problemTeams.push({
          ...team,
          actualSalesCount,
          actualTotalCount,
          excessSales: actualSalesCount - team.max_members
        });
      } else if (actualSalesCount === team.max_members) {
        console.log(`  🟡 销售员数量已满`);
      } else {
        console.log(`  🟢 销售员数量正常`);
      }
      
      // 更新团队的实际成员数量
      if (team.member_count !== actualTotalCount) {
        await run(`
          UPDATE teams 
          SET member_count = ?
          WHERE id = ?
        `, [actualTotalCount, team.id]);
        console.log(`  ✅ 已更新成员数量: ${team.member_count} → ${actualTotalCount}`);
      }
      
      console.log('');
    }
    
    // 3. 处理销售员数量超限的团队
    if (problemTeams.length > 0) {
      console.log(`⚠️  发现 ${problemTeams.length} 个团队销售员数量超限:\n`);
      
      for (const team of problemTeams) {
        console.log(`🔧 处理团队: ${team.name}`);
        console.log(`   需要移除 ${team.excessSales} 名销售员`);
        
        // 获取该团队的所有销售员，按入职时间排序（最后入职的先移除）
        const salesMembers = await query(`
          SELECT id, name, join_date
          FROM users 
          WHERE team_id = ? AND role = 'sales' AND deleted_at IS NULL
          ORDER BY join_date DESC
        `, [team.id]);
        
        console.log(`   团队销售员列表 (${salesMembers.length}人):`);
        salesMembers.forEach((member, index) => {
          console.log(`     ${index + 1}. ${member.name} (入职: ${member.join_date})`);
        });
        
        // 选择要移除的销售员（最后入职的）
        const membersToRemove = salesMembers.slice(0, team.excessSales);
        
        console.log(`   将移除以下销售员:`);
        membersToRemove.forEach(member => {
          console.log(`     - ${member.name}`);
        });
        
        // 执行移除操作
        for (const member of membersToRemove) {
          await run(
            'UPDATE users SET team_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [member.id]
          );
          console.log(`     ✅ 已移除 ${member.name}`);
        }
        
        // 重新计算团队成员数量
        const newMemberCount = await query(`
          SELECT COUNT(*) as count
          FROM users 
          WHERE team_id = ? AND deleted_at IS NULL
        `, [team.id]);
        
        await run(
          'UPDATE teams SET member_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newMemberCount[0].count, team.id]
        );
        
        console.log(`   ✅ 团队 "${team.name}" 修复完成\n`);
      }
    } else {
      console.log('✅ 所有团队的销售员数量都在限制范围内\n');
    }
    
    // 4. 显示修复后的状态
    console.log('📊 修复后的团队状态:');
    const updatedTeams = await query(`
      SELECT 
        t.id, 
        t.name, 
        t.level, 
        t.max_members, 
        t.member_count,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND role = 'sales' AND deleted_at IS NULL) as sales_count,
        (SELECT COUNT(*) FROM users WHERE team_id = t.id AND role = 'leader' AND deleted_at IS NULL) as leader_count
      FROM teams t
      WHERE t.deleted_at IS NULL
      ORDER BY t.name
    `);
    
    updatedTeams.forEach(team => {
      const status = team.sales_count > team.max_members ? '🔴 超限' : 
                    team.sales_count === team.max_members ? '🟡 已满' : '🟢 正常';
      console.log(`- ${team.name}: ${team.sales_count}/${team.max_members}销售员, ${team.leader_count}组长, 总${team.member_count}人 ${status}`);
    });
    
    // 5. 显示被移除的用户列表
    const unassignedUsers = await query(`
      SELECT id, name, role, phone, join_date
      FROM users 
      WHERE team_id IS NULL AND deleted_at IS NULL AND role IN ('sales', 'leader')
      ORDER BY role, name
    `);
    
    if (unassignedUsers.length > 0) {
      console.log(`\n👥 当前未分配团队的用户 (${unassignedUsers.length}人):`);
      unassignedUsers.forEach(user => {
        console.log(`- ${user.name} (${user.role}) - ${user.phone} - 入职: ${user.join_date}`);
      });
      console.log('\n💡 建议: 可以将这些用户重新分配到有空位的团队中');
    }
    
    console.log('\n🎉 小组等级限制修复完成！');
    console.log('📝 修复说明:');
    console.log('   - 小组等级限制现在只针对销售员数量');
    console.log('   - 组长不计入小组等级限制');
    console.log('   - 每个小组仍然只能有一个组长');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    closeDatabase();
  }
}

// 执行修复
if (require.main === module) {
  fixTeamSalesLimit();
}

module.exports = { fixTeamSalesLimit }; 
#!/usr/bin/env node

const { query, initDatabase } = require('../src/config/database-sqlite');
const bcrypt = require('bcryptjs');

// 虚拟数据生成器
const generateRandomPhone = () => {
  const prefixes = ['138', '139', '150', '151', '152', '158', '159', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
};

const generateRandomName = (type = 'sales') => {
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
  const salesNames = ['小明', '小红', '小华', '小丽', '小强', '小芳', '小军', '小燕', '小东', '小梅', '小刚', '小娟', '小伟', '小敏', '小峰', '小霞', '小龙', '小凤', '小虎', '小兰'];
  const leaderNames = ['经理', '主管', '组长', '总监', '领导'];
  
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  if (type === 'leader') {
    const title = leaderNames[Math.floor(Math.random() * leaderNames.length)];
    return surname + title;
  } else {
    const name = salesNames[Math.floor(Math.random() * salesNames.length)];
    return surname + name;
  }
};

const generateRandomCompany = () => {
  const prefixes = ['华为', '腾讯', '阿里', '百度', '京东', '美团', '滴滴', '字节', '小米', '联想'];
  const suffixes = ['科技', '集团', '公司', '企业', '有限公司', '股份公司', '实业', '控股'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return prefix + suffix;
};

const generateRandomAddress = () => {
  const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '武汉市', '成都市', '西安市', '重庆市'];
  const districts = ['朝阳区', '海淀区', '浦东新区', '黄浦区', '天河区', '福田区', '西湖区', '江干区', '玄武区', '鼓楼区'];
  const streets = ['中山路', '人民路', '解放路', '建设路', '和平路', '胜利路', '光明路', '文化路', '学院路', '科技路'];
  
  const city = cities[Math.floor(Math.random() * cities.length)];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${city}${district}${street}${number}号`;
};

const generateRandomEmail = (name) => {
  const domains = ['qq.com', '163.com', '126.com', 'gmail.com', 'sina.com', 'sohu.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = name.toLowerCase() + Math.floor(Math.random() * 1000);
  return `${username}@${domain}`;
};

const generateRandomDate = (daysAgo = 365) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD格式
};

async function addDemoData() {
  console.log('🚀 开始添加虚拟演示数据...\n');
  
  try {
    // 初始化数据库连接
    await initDatabase();
    
    // 1. 添加5个组长
    console.log('1. 添加5个组长...');
    const leaders = [];
    for (let i = 0; i < 5; i++) {
      const name = generateRandomName('leader');
      const phone = generateRandomPhone();
      const hashedPassword = await bcrypt.hash('123456', 10);
      const joinDate = generateRandomDate(180); // 最近半年内入职
      
      const result = await query(`
        INSERT INTO users (name, phone, password, role, join_date, status)
        VALUES (?, ?, ?, 'leader', ?, 'active')
      `, [name, phone, hashedPassword, joinDate]);
      
      leaders.push({
        id: result.lastID,
        name,
        phone
      });
      
      console.log(`  ✅ 添加组长: ${name} (${phone})`);
    }
    
    // 2. 添加15个销售人员
    console.log('\n2. 添加15个销售人员...');
    const salespeople = [];
    for (let i = 0; i < 15; i++) {
      const name = generateRandomName('sales');
      const phone = generateRandomPhone();
      const hashedPassword = await bcrypt.hash('123456', 10);
      const joinDate = generateRandomDate(365); // 最近一年内入职
      
      const result = await query(`
        INSERT INTO users (name, phone, password, role, join_date, status)
        VALUES (?, ?, ?, 'sales', ?, 'active')
      `, [name, phone, hashedPassword, joinDate]);
      
      salespeople.push({
        id: result.lastID,
        name,
        phone
      });
      
      console.log(`  ✅ 添加销售: ${name} (${phone})`);
    }
    
    // 3. 创建新的团队并分配组长和成员
    console.log('\n3. 创建新团队并分配成员...');
    const timestamp = Date.now().toString().slice(-4); // 使用时间戳后4位确保唯一性
    const teamNames = [
      `华东销售组${timestamp}`, 
      `华南销售组${timestamp}`, 
      `华北销售组${timestamp}`, 
      `西南销售组${timestamp}`, 
      `华中销售组${timestamp}`
    ];
    const teamLevels = ['10', '15', '10', '15', '10'];
    
    for (let i = 0; i < 5; i++) {
      const leader = leaders[i];
      const teamName = teamNames[i];
      const level = teamLevels[i];
      const maxMembers = level === '10' ? 10 : 15;
      
      // 创建团队
      const teamResult = await query(`
        INSERT INTO teams (name, level, leader_id, max_members, description)
        VALUES (?, ?, ?, ?, ?)
      `, [teamName, level, leader.id, maxMembers, `${teamName}负责相应区域的销售业务`]);
      
      const teamId = teamResult.lastID;
      
      // 分配组长到团队
      await query('UPDATE users SET team_id = ? WHERE id = ?', [teamId, leader.id]);
      
      // 分配3个销售人员到每个团队
      const teamMembers = salespeople.slice(i * 3, (i + 1) * 3);
      for (const member of teamMembers) {
        await query('UPDATE users SET team_id = ? WHERE id = ?', [teamId, member.id]);
      }
      
      // 更新团队成员数量
      const memberCount = teamMembers.length + 1; // 包括组长
      await query('UPDATE teams SET member_count = ? WHERE id = ?', [memberCount, teamId]);
      
      console.log(`  ✅ 创建团队: ${teamName} (组长: ${leader.name}, 成员: ${memberCount}人)`);
    }
    
    // 4. 添加50个客户
    console.log('\n4. 添加50个客户...');
    const qualifications = ['A级客户', 'B级客户', 'C级客户', 'D级客户'];
    const genders = ['male', 'female'];
    
    // 获取所有销售人员和团队信息用于随机分配
    const allSales = await query(`
      SELECT u.id, u.team_id 
      FROM users u 
      WHERE u.role IN ("sales", "leader") AND u.deleted_at IS NULL AND u.team_id IS NOT NULL
    `);
    
    for (let i = 0; i < 50; i++) {
      const name = generateRandomName('sales');
      const phone = generateRandomPhone();
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const age = Math.floor(Math.random() * 40) + 25; // 25-65岁
      const qualification = qualifications[Math.floor(Math.random() * qualifications.length)];
      const starLevel = Math.floor(Math.random() * 5) + 1; // 1-5星级
      
      // 随机分配给一个销售人员
      const assignedSales = allSales[Math.floor(Math.random() * allSales.length)];
      const ownerId = assignedSales.id;
      const teamId = assignedSales.team_id;
      
      try {
        const result = await query(`
          INSERT INTO customers (
            star_level, name, phone, gender, age, qualification, 
            owner_id, team_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          starLevel, name, phone, gender, age, qualification,
          ownerId, teamId
        ]);
        
        // 获取刚插入的客户ID
        const customerResult = await query(`
          SELECT id FROM customers WHERE phone = ? ORDER BY id DESC LIMIT 1
        `, [phone]);
        
        const customerId = customerResult[0]?.id;
        console.log(`  ✅ 添加客户: ${name} (${phone}) - ${qualification} (ID: ${customerId})`);
        
        // 为部分客户添加跟进记录
        if (Math.random() > 0.5 && customerId) {
          const followTypes = ['电话沟通', '邮件联系', '上门拜访', '产品演示', '报价单'];
          const followType = followTypes[Math.floor(Math.random() * followTypes.length)];
          const followContent = `与客户进行${followType}，了解需求并介绍产品特点`;
          
          console.log(`    添加跟进记录: 客户ID=${customerId}, 销售ID=${ownerId}`);
          
          await query(`
            INSERT INTO follow_records (
              customer_id, sales_id, content, follow_time
            ) VALUES (?, ?, ?, ?)
          `, [
            customerId, 
            ownerId, 
            followContent,
            new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // 过去30天内随机时间
          ]);
          
          // 更新客户的跟进统计
          await query(`
            UPDATE customers 
            SET follow_count = follow_count + 1, last_follow_time = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [customerId]);
        }
      } catch (error) {
        console.error(`添加客户失败: ${name}`, error.message);
      }
    }
    
    // 5. 显示统计信息
    console.log('\n5. 数据统计...');
    
    const userStats = await query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE deleted_at IS NULL 
      GROUP BY role
    `);
    
    const teamStats = await query(`
      SELECT COUNT(*) as count, SUM(member_count) as total_members
      FROM teams 
      WHERE deleted_at IS NULL
    `);
    
    const customerStats = await query(`
      SELECT qualification, COUNT(*) as count 
      FROM customers 
      WHERE deleted_at IS NULL 
      GROUP BY qualification
    `);
    
    const followStats = await query(`
      SELECT COUNT(*) as count 
      FROM follow_records
    `);
    
    console.log('\n📊 数据统计结果:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                      用户统计                           │');
    console.log('├─────────────────────────────────────────────────────────┤');
    userStats.forEach(stat => {
      const roleName = stat.role === 'manager' ? '管理员' : 
                      stat.role === 'leader' ? '组长' : '销售员';
      console.log(`│ ${roleName.padEnd(10)} │ ${stat.count.toString().padEnd(6)} 人 │`);
    });
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│ 团队数量: ${teamStats[0].count} 个，总成员: ${teamStats[0].total_members} 人                    │`);
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│                      客户统计                           │');
    console.log('├─────────────────────────────────────────────────────────┤');
    customerStats.forEach(stat => {
      console.log(`│ ${stat.qualification.padEnd(10)} │ ${stat.count.toString().padEnd(6)} 个 │`);
    });
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│ 跟进记录: ${followStats[0].count} 条                                  │`);
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n✅ 虚拟演示数据添加完成！');
    console.log('\n📋 新增账号信息（密码统一为: 123456）:');
    console.log('组长账号:');
    leaders.forEach(leader => {
      console.log(`  - ${leader.name}: ${leader.phone}`);
    });
    console.log('\n销售员账号:');
    salespeople.forEach(sales => {
      console.log(`  - ${sales.name}: ${sales.phone}`);
    });
    
  } catch (error) {
    console.error('❌ 添加演示数据失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  addDemoData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { addDemoData }; 
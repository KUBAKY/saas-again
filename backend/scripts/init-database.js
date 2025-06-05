const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 创建数据库和表的SQL语句
const createDatabaseSQL = `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'tscrm'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;

const createTablesSQL = [
  // 用户表
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    \`phone\` varchar(11) NOT NULL COMMENT '手机号(登录账号)',
    \`password\` varchar(255) NOT NULL COMMENT '密码(bcrypt加密)',
    \`name\` varchar(50) NOT NULL COMMENT '用户姓名',
    \`role\` enum('manager','leader','sales') NOT NULL COMMENT '用户角色',
    \`team_id\` int DEFAULT NULL COMMENT '所属小组ID',
    \`join_date\` date NOT NULL COMMENT '入职时间',
    \`status\` enum('active','inactive') DEFAULT 'active' COMMENT '用户状态',
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    \`deleted_at\` timestamp NULL DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_phone\` (\`phone\`),
    KEY \`idx_team_id\` (\`team_id\`),
    KEY \`idx_role\` (\`role\`),
    KEY \`idx_status\` (\`status\`),
    KEY \`idx_deleted_at\` (\`deleted_at\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'`,

  // 小组表
  `CREATE TABLE IF NOT EXISTS \`teams\` (
    \`id\` int NOT NULL AUTO_INCREMENT COMMENT '小组ID',
    \`name\` varchar(100) NOT NULL COMMENT '小组名称',
    \`level\` enum('4','10','15','30') NOT NULL COMMENT '小组等级(人数限制)',
    \`leader_id\` int DEFAULT NULL COMMENT '组长ID',
    \`member_count\` int DEFAULT 0 COMMENT '当前成员数量',
    \`max_members\` int NOT NULL COMMENT '最大成员数量',
    \`description\` text COMMENT '小组描述',
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    \`deleted_at\` timestamp NULL DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`uk_name\` (\`name\`),
    KEY \`idx_leader_id\` (\`leader_id\`),
    KEY \`idx_level\` (\`level\`),
    KEY \`idx_deleted_at\` (\`deleted_at\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小组表'`,

  // 客户表
  `CREATE TABLE IF NOT EXISTS \`customers\` (
    \`id\` int NOT NULL AUTO_INCREMENT COMMENT '客户ID',
    \`star_level\` tinyint NOT NULL COMMENT '价值星级(1-5)',
    \`name\` varchar(50) NOT NULL COMMENT '客户姓名',
    \`phone\` varchar(20) NOT NULL COMMENT '客户电话',
    \`gender\` enum('male','female') DEFAULT NULL COMMENT '性别',
    \`age\` tinyint DEFAULT NULL COMMENT '年龄',
    \`qualification\` text COMMENT '客户资质描述',
    \`requirements\` text COMMENT '客户需求',
    \`owner_id\` int NOT NULL COMMENT '归属销售员ID',
    \`team_id\` int NOT NULL COMMENT '归属小组ID',
    \`last_follow_time\` timestamp NULL DEFAULT NULL COMMENT '最后跟进时间',
    \`follow_count\` int DEFAULT 0 COMMENT '总跟进次数',
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    \`deleted_at\` timestamp NULL DEFAULT NULL COMMENT '删除时间(软删除)',
    PRIMARY KEY (\`id\`),
    KEY \`idx_phone\` (\`phone\`),
    KEY \`idx_owner_id\` (\`owner_id\`),
    KEY \`idx_team_id\` (\`team_id\`),
    KEY \`idx_star_level\` (\`star_level\`),
    KEY \`idx_last_follow_time\` (\`last_follow_time\`),
    KEY \`idx_created_at\` (\`created_at\`),
    KEY \`idx_deleted_at\` (\`deleted_at\`),
    KEY \`idx_owner_star\` (\`owner_id\`, \`star_level\`),
    KEY \`idx_team_star\` (\`team_id\`, \`star_level\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表'`,

  // 跟进记录表
  `CREATE TABLE IF NOT EXISTS \`follow_records\` (
    \`id\` int NOT NULL AUTO_INCREMENT COMMENT '跟进记录ID',
    \`customer_id\` int NOT NULL COMMENT '客户ID',
    \`sales_id\` int NOT NULL COMMENT '跟进销售员ID',
    \`content\` text NOT NULL COMMENT '跟进内容',
    \`follow_time\` timestamp NOT NULL COMMENT '跟进时间',
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    PRIMARY KEY (\`id\`),
    KEY \`idx_customer_id\` (\`customer_id\`),
    KEY \`idx_sales_id\` (\`sales_id\`),
    KEY \`idx_follow_time\` (\`follow_time\`),
    KEY \`idx_customer_follow_time\` (\`customer_id\`, \`follow_time\` DESC),
    KEY \`idx_sales_follow_time\` (\`sales_id\`, \`follow_time\` DESC),
    KEY \`idx_follow_date\` ((DATE(\`follow_time\`)))
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跟进记录表'`,

  // 操作日志表
  `CREATE TABLE IF NOT EXISTS \`operation_logs\` (
    \`id\` int NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    \`user_id\` int NOT NULL COMMENT '操作用户ID',
    \`action\` varchar(50) NOT NULL COMMENT '操作类型',
    \`target_type\` varchar(20) NOT NULL COMMENT '目标类型',
    \`target_id\` int NOT NULL COMMENT '目标ID',
    \`details\` json DEFAULT NULL COMMENT '操作详情(JSON格式)',
    \`ip_address\` varchar(45) DEFAULT NULL COMMENT '操作IP地址',
    \`user_agent\` text COMMENT '用户代理',
    \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (\`id\`),
    KEY \`idx_user_id\` (\`user_id\`),
    KEY \`idx_action\` (\`action\`),
    KEY \`idx_target\` (\`target_type\`, \`target_id\`),
    KEY \`idx_created_at\` (\`created_at\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表'`
];

// 外键约束SQL
const foreignKeysSQL = [
  `ALTER TABLE \`users\` 
   ADD CONSTRAINT \`fk_users_team_id\` 
   FOREIGN KEY (\`team_id\`) REFERENCES \`teams\` (\`id\`) 
   ON DELETE SET NULL ON UPDATE CASCADE`,

  `ALTER TABLE \`teams\` 
   ADD CONSTRAINT \`fk_teams_leader_id\` 
   FOREIGN KEY (\`leader_id\`) REFERENCES \`users\` (\`id\`) 
   ON DELETE SET NULL ON UPDATE CASCADE`,

  `ALTER TABLE \`customers\` 
   ADD CONSTRAINT \`fk_customers_owner_id\` 
   FOREIGN KEY (\`owner_id\`) REFERENCES \`users\` (\`id\`) 
   ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE \`customers\` 
   ADD CONSTRAINT \`fk_customers_team_id\` 
   FOREIGN KEY (\`team_id\`) REFERENCES \`teams\` (\`id\`) 
   ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE \`follow_records\` 
   ADD CONSTRAINT \`fk_follow_records_customer_id\` 
   FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) 
   ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE \`follow_records\` 
   ADD CONSTRAINT \`fk_follow_records_sales_id\` 
   FOREIGN KEY (\`sales_id\`) REFERENCES \`users\` (\`id\`) 
   ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE \`operation_logs\` 
   ADD CONSTRAINT \`fk_operation_logs_user_id\` 
   FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) 
   ON DELETE RESTRICT ON UPDATE CASCADE`
];

// 初始化数据
async function insertInitialData(connection) {
  try {
    // 创建默认管理员账号
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(
      `INSERT IGNORE INTO users (phone, password, name, role, join_date) 
       VALUES ('13800000000', ?, '系统管理员', 'manager', CURDATE())`,
      [adminPassword]
    );

    // 创建示例团队
    await connection.execute(
      `INSERT IGNORE INTO teams (name, level, max_members, description) 
       VALUES ('销售一组', '10', 10, '示例销售团队')`
    );

    // 创建示例组长账号
    const leaderPassword = await bcrypt.hash('leader123', 12);
    await connection.execute(
      `INSERT IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES ('13800000001', ?, '张组长', 'leader', 1, CURDATE())`,
      [leaderPassword]
    );

    // 更新团队组长
    await connection.execute(
      `UPDATE teams SET leader_id = 2, member_count = 1 WHERE id = 1`
    );

    // 创建示例销售员账号
    const salesPassword = await bcrypt.hash('sales123', 12);
    await connection.execute(
      `INSERT IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES ('13800000002', ?, '李销售', 'sales', 1, CURDATE())`,
      [salesPassword]
    );

    // 更新团队成员数量
    await connection.execute(
      `UPDATE teams SET member_count = 2 WHERE id = 1`
    );

    console.log('✅ 初始数据插入成功');
    console.log('📋 默认账号信息:');
    console.log('   管理员: 13800000000 / admin123');
    console.log('   组长: 13800000001 / leader123');
    console.log('   销售员: 13800000002 / sales123');

  } catch (error) {
    console.error('❌ 初始数据插入失败:', error.message);
    throw error;
  }
}

// 主函数
async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 连接MySQL服务器（不指定数据库）
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接MySQL服务器成功');

    // 创建数据库
    await connection.execute(createDatabaseSQL);
    console.log(`✅ 数据库 ${process.env.DB_NAME || 'tscrm'} 创建成功`);

    // 切换到目标数据库
    await connection.execute(`USE \`${process.env.DB_NAME || 'tscrm'}\``);

    // 创建表
    console.log('📝 开始创建数据表...');
    for (const sql of createTablesSQL) {
      await connection.execute(sql);
    }
    console.log('✅ 数据表创建成功');

    // 添加外键约束
    console.log('🔗 开始添加外键约束...');
    for (const sql of foreignKeysSQL) {
      try {
        await connection.execute(sql);
      } catch (error) {
        // 忽略外键已存在的错误
        if (!error.message.includes('Duplicate key name')) {
          throw error;
        }
      }
    }
    console.log('✅ 外键约束添加成功');

    // 插入初始数据
    console.log('📊 开始插入初始数据...');
    await insertInitialData(connection);

    console.log('🎉 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 
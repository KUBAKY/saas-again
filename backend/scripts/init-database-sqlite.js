const bcrypt = require('bcryptjs');
const { initDatabase, query, transaction, closeDatabase } = require('../src/config/database-sqlite');

// 创建表的SQL语句（SQLite语法）
const createTablesSQL = [
  // 用户表
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(11) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role TEXT CHECK(role IN ('admin','manager','leader','sales')) NOT NULL,
    team_id INTEGER,
    join_date DATE NOT NULL,
    status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  )`,

  // 小组表
  `CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    level TEXT CHECK(level IN ('4','10','15','30')) NOT NULL,
    leader_id INTEGER,
    member_count INTEGER DEFAULT 0,
    max_members INTEGER NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  )`,

  // 客户表
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    star_level INTEGER NOT NULL CHECK(star_level >= 1 AND star_level <= 5),
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender TEXT CHECK(gender IN ('male','female')),
    age INTEGER,
    qualification TEXT,
    requirements TEXT,
    owner_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    last_follow_time DATETIME,
    follow_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
  )`,

  // 跟进记录表
  `CREATE TABLE IF NOT EXISTS follow_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    sales_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    follow_time DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 操作日志表
  `CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id INTEGER NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

// 创建索引
const createIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)',
  'CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id)',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
  'CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id)',
  'CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON customers(owner_id)',
  'CREATE INDEX IF NOT EXISTS idx_customers_team_id ON customers(team_id)',
  'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_unique ON customers(phone) WHERE deleted_at IS NULL',
  'CREATE INDEX IF NOT EXISTS idx_follow_records_customer_id ON follow_records(customer_id)',
  'CREATE INDEX IF NOT EXISTS idx_follow_records_sales_id ON follow_records(sales_id)',
  'CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id)'
];

// 初始化数据
async function insertInitialData() {
  try {
    // 创建系统管理员账号
    const adminPassword = await bcrypt.hash('123456', 12);
    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, join_date) 
       VALUES (?, ?, '系统管理员', 'admin', date('now'))`,
      ['13800000000', adminPassword]
    );

    // 创建总经理账号
    const managerPassword = await bcrypt.hash('123456', 12);
    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, join_date) 
       VALUES (?, ?, '总经理', 'manager', date('now'))`,
      ['13800000001', managerPassword]
    );

    // 创建示例团队
    await query(
      `INSERT OR IGNORE INTO teams (name, level, max_members, description) 
       VALUES ('华东销售组7091', '10', 10, '华东地区销售团队')`
    );

    await query(
      `INSERT OR IGNORE INTO teams (name, level, max_members, description) 
       VALUES ('华南销售组8812', '15', 15, '华南地区销售团队')`
    );

    // 创建组长账号
    const leaderPassword = await bcrypt.hash('123456', 12);
    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '李组长', 'leader', 1, date('now'))`,
      ['13800000002', leaderPassword]
    );

    // 更新团队组长
    await query(
      `UPDATE teams SET leader_id = 3, member_count = 1 WHERE id = 1`
    );

    // 创建销售员账号
    const salesPassword = await bcrypt.hash('123456', 12);
    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '孙小明', 'sales', 1, date('now'))`,
      ['13800000003', salesPassword]
    );

    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '徐小刚', 'sales', 1, date('now'))`,
      ['13800000004', salesPassword]
    );

    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '徐小亮', 'sales', 1, date('now'))`,
      ['13800000005', salesPassword]
    );

    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '徐小强', 'sales', 2, date('now'))`,
      ['13800000006', salesPassword]
    );

    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '徐小峰', 'sales', 2, date('now'))`,
      ['13800000007', salesPassword]
    );

    await query(
      `INSERT OR IGNORE INTO users (phone, password, name, role, team_id, join_date) 
       VALUES (?, ?, '徐小龙', 'sales', 2, date('now'))`,
      ['13800000008', salesPassword]
    );

    // 更新团队成员数量
    await query(
      `UPDATE teams SET member_count = 4 WHERE id = 1`
    );

    await query(
      `UPDATE teams SET member_count = 3 WHERE id = 2`
    );

    // 创建示例客户
    const customers = [
      [5, '张三', '13900000001', 'male', 30, '高价值客户', '需要专业服务', 4, 1],
      [3, '李四', '13900000002', 'female', 25, '潜在客户', '价格敏感', 4, 1],
      [4, '王五', '13900000003', 'male', 35, '意向客户', '需要技术支持', 5, 1],
      [2, '赵六', '13900000004', 'female', 28, '普通客户', '基础需求', 5, 1],
      [5, '钱七', '13900000005', 'male', 40, '重要客户', '长期合作', 6, 1],
      [3, '孙八', '13900000006', 'female', 32, '跟进客户', '考虑中', 7, 2],
      [4, '周九', '13900000007', 'male', 29, '有效客户', '有购买意向', 8, 2],
      [2, '吴十', '13900000008', 'female', 26, '新客户', '初步了解', 9, 2]
    ];

    for (const customer of customers) {
      await query(
        `INSERT OR IGNORE INTO customers (star_level, name, phone, gender, age, qualification, requirements, owner_id, team_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        customer
      );
    }

    // 创建示例跟进记录
    const followRecords = [
      [1, 4, '初次联系，客户表示有兴趣', 'datetime("now", "-1 day")'],
      [1, 4, '发送产品资料，客户要求详细报价', 'datetime("now", "-6 hours")'],
      [2, 4, '电话沟通，了解客户需求', 'datetime("now", "-2 days")'],
      [3, 5, '客户来访，进行产品演示', 'datetime("now", "-3 hours")'],
      [4, 5, '跟进报价进度，客户考虑中', 'datetime("now", "-1 hour")'],
      [5, 6, '客户确认购买意向', 'datetime("now", "-4 days")'],
      [6, 7, '新客户开发，初步接触', 'datetime("now", "-5 days")'],
      [7, 8, '客户反馈积极，安排下次会面', 'datetime("now", "-2 hours")']
    ];

    for (const [customerId, salesId, content, followTime] of followRecords) {
      await query(
        `INSERT OR IGNORE INTO follow_records (customer_id, sales_id, content, follow_time) 
         VALUES (?, ?, ?, ${followTime})`,
        [customerId, salesId, content]
      );
    }

    // 更新客户的跟进统计
    await query(`
      UPDATE customers SET 
        follow_count = (
          SELECT COUNT(*) FROM follow_records 
          WHERE customer_id = customers.id
        ),
        last_follow_time = (
          SELECT MAX(follow_time) FROM follow_records 
          WHERE customer_id = customers.id
        )
    `);

    console.log('✅ 初始数据插入成功');
    console.log('📋 默认账号信息:');
    console.log('   系统管理员: 13800000000 / 123456');
    console.log('   总经理: 13800000001 / 123456');
    console.log('   组长: 13800000002 / 123456');
    console.log('   销售员: 13800000003 / 123456');

  } catch (error) {
    console.error('❌ 初始数据插入失败:', error.message);
    throw error;
  }
}

// 主函数
async function initSQLiteDatabase() {
  try {
    console.log('🚀 开始初始化SQLite数据库...');
    
    // 初始化数据库连接
    await initDatabase();

    // 创建表
    console.log('📝 开始创建数据表...');
    for (const sql of createTablesSQL) {
      await query(sql);
    }
    console.log('✅ 数据表创建成功');

    // 创建索引
    console.log('🔗 开始创建索引...');
    for (const sql of createIndexesSQL) {
      await query(sql);
    }
    console.log('✅ 索引创建成功');

    // 插入初始数据
    console.log('📊 开始插入初始数据...');
    await insertInitialData();

    console.log('🎉 SQLite数据库初始化完成！');
    console.log('📁 数据库文件位置: backend/data/tscrm.db');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// 运行初始化
if (require.main === module) {
  initSQLiteDatabase();
}

module.exports = { initSQLiteDatabase };
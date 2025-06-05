const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tscrm',
  charset: 'utf8mb4'
};

async function addRequirementsField() {
  let connection;
  
  try {
    console.log('🚀 开始添加requirements字段...');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接数据库成功');

    // 检查字段是否已存在
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'requirements'
    `, [process.env.DB_NAME || 'tscrm']);

    if (columns.length > 0) {
      console.log('✅ requirements字段已存在，无需添加');
      return;
    }

    // 添加requirements字段
    await connection.execute(`
      ALTER TABLE customers 
      ADD COLUMN requirements TEXT COMMENT '客户需求' 
      AFTER qualification
    `);
    
    console.log('✅ requirements字段添加成功');

  } catch (error) {
    console.error('❌ 添加requirements字段失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行迁移
if (require.main === module) {
  addRequirementsField()
    .then(() => {
      console.log('🎉 迁移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 迁移失败:', error);
      process.exit(1);
    });
}

module.exports = addRequirementsField; 
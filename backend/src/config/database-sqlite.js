const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// SQLite数据库文件路径
const dbPath = path.join(__dirname, '../../data/tscrm.db');

// 创建数据库连接
let db = null;

// 初始化数据库连接
function initDatabase() {
  return new Promise((resolve, reject) => {
    // 确保data目录存在
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite数据库连接失败:', err.message);
        reject(err);
      } else {
        console.log('✅ SQLite数据库连接成功');
        resolve(db);
      }
    });
  });
}

// 测试数据库连接
async function testConnection() {
  try {
    if (!db) {
      await initDatabase();
    }
    return new Promise((resolve) => {
      db.get("SELECT 1", (err) => {
        if (err) {
          console.error('❌ 数据库连接测试失败:', err.message);
          resolve(false);
        } else {
          console.log('✅ 数据库连接测试成功');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 执行查询的通用方法
async function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }

    // 判断是否是SELECT查询
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('数据库查询错误:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } else {
      // INSERT, UPDATE, DELETE等操作
      db.run(sql, params, function(err) {
        if (err) {
          console.error('数据库操作错误:', err);
          reject(err);
        } else {
          resolve({
            insertId: this.lastID,
            changes: this.changes
          });
        }
      });
    }
  });
}

// 执行事务
async function transaction(callback) {
  return new Promise(async (resolve, reject) => {
    try {
      await query('BEGIN TRANSACTION');
      
      const mockConnection = {
        execute: async (sql, params) => {
          const result = await query(sql, params);
          return [result];
        }
      };
      
      const result = await callback(mockConnection);
      await query('COMMIT');
      resolve(result);
    } catch (error) {
      await query('ROLLBACK');
      reject(error);
    }
  });
}

// 关闭数据库连接
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

module.exports = {
  initDatabase,
  query,
  transaction,
  testConnection,
  closeDatabase
}; 
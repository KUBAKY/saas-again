const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(__dirname, 'data/tscrm.db');

async function testFollowRecordUpdate() {
  const db = new sqlite3.Database(dbPath);
  
  try {
    console.log('🧪 测试跟进记录更新客户最后跟进时间...\n');
    
    // 1. 选择一个客户
    const customer = await new Promise((resolve, reject) => {
      db.get("SELECT id, name, last_follow_time FROM customers WHERE id = 1", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('📋 测试客户信息:');
    console.log(`ID: ${customer.id}`);
    console.log(`姓名: ${customer.name}`);
    console.log(`当前最后跟进时间: ${customer.last_follow_time}\n`);
    
    // 2. 添加新的跟进记录
    const newFollowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const content = '测试跟进记录 - 验证时间更新';
    
    console.log('📝 添加新跟进记录...');
    console.log(`跟进时间: ${newFollowTime}`);
    console.log(`跟进内容: ${content}\n`);
    
    // 插入跟进记录
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO follow_records (customer_id, sales_id, content, follow_time) VALUES (?, ?, ?, ?)",
        [customer.id, 1, content, newFollowTime],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // 3. 更新客户的最后跟进时间
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE customers SET last_follow_time = ?, follow_count = follow_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [newFollowTime, customer.id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
    
    // 4. 验证更新结果
    const updatedCustomer = await new Promise((resolve, reject) => {
      db.get("SELECT id, name, last_follow_time, follow_count FROM customers WHERE id = ?", [customer.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('✅ 更新后的客户信息:');
    console.log(`ID: ${updatedCustomer.id}`);
    console.log(`姓名: ${updatedCustomer.name}`);
    console.log(`最后跟进时间: ${updatedCustomer.last_follow_time}`);
    console.log(`跟进次数: ${updatedCustomer.follow_count}\n`);
    
    // 5. 验证是否成功更新
    if (updatedCustomer.last_follow_time === newFollowTime) {
      console.log('🎉 测试成功！客户的最后跟进时间已正确更新');
    } else {
      console.log('❌ 测试失败！客户的最后跟进时间未更新');
      console.log(`期望: ${newFollowTime}`);
      console.log(`实际: ${updatedCustomer.last_follow_time}`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    db.close();
  }
}

// 运行测试
testFollowRecordUpdate(); 
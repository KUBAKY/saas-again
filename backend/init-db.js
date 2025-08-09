const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function initializeDatabase() {
  console.log('🗄️  初始化数据库...');
  
  try {
    // 运行数据库种子数据
    console.log('🌱 执行种子数据命令...');
    const { stdout, stderr } = await execAsync('npm run seed');
    
    if (stdout) {
      console.log('输出:', stdout);
    }
    
    if (stderr) {
      console.warn('警告:', stderr);
    }
    
    console.log('✅ 数据库初始化完成!');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    if (error.stdout) {
      console.log('输出:', error.stdout);
    }
    if (error.stderr) {
      console.error('错误:', error.stderr);
    }
    process.exit(1);
  }
}

initializeDatabase();
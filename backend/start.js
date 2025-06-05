#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 赋优客户服务管理系统FuYouCSM - 后端启动脚本');
console.log('=====================================');

// 检查环境变量文件
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  未找到 .env 文件，正在创建默认配置...');
  
  const defaultEnv = `# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tscrm

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=24h

# 密码加密配置
BCRYPT_ROUNDS=12

# 服务器配置
PORT=3001
NODE_ENV=development

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 邮件配置（可选）
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log`;

  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ 已创建默认 .env 文件');
}

// 检查上传目录
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log('✅ 已创建上传目录');
}

// 检查日志目录
const logPath = path.join(__dirname, 'logs');
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
  console.log('✅ 已创建日志目录');
}

console.log('');
console.log('📋 启动前检查清单:');
console.log('1. ✅ 环境变量配置文件');
console.log('2. ✅ 上传目录');
console.log('3. ✅ 日志目录');
console.log('4. ⚠️  请确保MySQL数据库已启动');
console.log('5. ⚠️  请确保数据库 "tscrm" 已创建');
console.log('');

console.log('🔧 下一步操作:');
console.log('1. 修改 .env 文件中的数据库配置');
console.log('2. 运行数据库初始化: npm run init-db');
console.log('3. 启动服务器: npm start 或 npm run dev');
console.log('');

console.log('📚 API接口文档:');
console.log('- 认证接口: http://localhost:3001/api/auth');
console.log('- 客户管理: http://localhost:3001/api/customers');
console.log('- 跟进记录: http://localhost:3001/api/follow-records');
console.log('- 团队管理: http://localhost:3001/api/teams');
console.log('- 用户管理: http://localhost:3001/api/users');
console.log('- 统计报表: http://localhost:3001/api/statistics');
console.log('- 健康检查: http://localhost:3001/health');
console.log('');

console.log('🎯 准备就绪！现在可以启动服务器了。'); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./src/config/database-sqlite');
const authRoutes = require('./src/routes/auth-sqlite');
const teamsRoutes = require('./src/routes/teams-sqlite');
const usersRoutes = require('./src/routes/users-sqlite');
const customersRoutes = require('./src/routes/customers-sqlite');
const statisticsRoutes = require('./src/routes/statistics-sqlite');
const followRecordsRoutes = require('./src/routes/followRecords-sqlite');

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// 请求日志
app.use(morgan('combined'));

// 跨域配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000'] // 生产环境允许的域名
    : true, // 开发环境允许所有域名
  credentials: true
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 限制每个IP 15分钟内最多1000个请求
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    timestamp: Date.now()
  }
});
app.use('/api/', limiter);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'SQLite',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/followRecords', followRecordsRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    timestamp: Date.now()
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  // 数据库连接错误
  if (error.code === 'ECONNREFUSED') {
    return res.status(500).json({
      code: 500,
      message: '数据库连接失败',
      timestamp: Date.now()
    });
  }
  
  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '访问令牌无效',
      timestamp: Date.now()
    });
  }
  
  // 默认错误响应
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : error.message,
    timestamp: Date.now()
  });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，请检查配置');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 服务器启动成功`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🗄️  数据库: SQLite`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/health`);
      console.log(`📋 默认账号: 13800000000 / 123456`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('📴 收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 启动应用
startServer(); 
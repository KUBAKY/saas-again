const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 测试登录接口（不连接数据库）
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;
  
  // 简单的测试验证
  if (phone === '13800000000' && password === 'admin123') {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'test-token-123',
        user: {
          id: 1,
          phone: '13800000000',
          name: '测试管理员',
          role: 'manager'
        }
      },
      timestamp: Date.now()
    });
  } else {
    res.status(401).json({
      code: 401,
      message: '手机号或密码错误',
      timestamp: Date.now()
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 测试服务器启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔑 测试账号: 13800000000 / admin123`);
}); 
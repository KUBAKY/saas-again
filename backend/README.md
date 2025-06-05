# 电话销售管理系统 - 后端API

## 项目简介

这是一个基于Node.js + Express + MySQL的电话销售管理系统后端API，提供用户管理、团队管理、客户管理、跟进记录等功能。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Joi** - 数据验证
- **helmet** - 安全中间件
- **morgan** - 日志中间件

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── controllers/     # 控制器
│   │   └── authController.js
│   ├── middleware/      # 中间件
│   │   └── auth.js      # 认证中间件
│   ├── models/          # 数据模型
│   │   └── User.js
│   ├── routes/          # 路由
│   │   └── auth.js
│   ├── services/        # 业务逻辑层
│   └── utils/           # 工具函数
│       ├── response.js  # 统一响应格式
│       └── validation.js # 数据验证
├── scripts/
│   └── init-database.js # 数据库初始化脚本
├── .env                 # 环境变量配置
├── package.json
└── server.js           # 主服务器文件
```

## 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- MySQL >= 8.0
- npm >= 6.0.0

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env` 文件并修改数据库配置：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tscrm

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
```

### 4. 初始化数据库

```bash
npm run init-db
```

这将创建数据库、表结构并插入初始数据。

### 5. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务器将在 `http://localhost:3001` 启动。

## 默认账号

数据库初始化后会创建以下测试账号：

| 角色 | 手机号 | 密码 | 说明 |
|------|--------|------|------|
| 系统管理员 | 13800000000 | 123456 | 系统管理员 |
| 总经理 | 13800000001 | 123456 | 总经理 |
| 组长 | 13800000002 | 123456 | 销售组长 |
| 销售员 | 13800000003 | 123456 | 普通销售员 |

## API接口

### 认证相关

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取当前用户信息
- `PUT /api/auth/password` - 修改密码
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 用户登出

### 健康检查

- `GET /health` - 服务健康检查

## 数据库设计

### 核心表结构

1. **users** - 用户表
   - 存储系统用户信息（管理员、组长、销售员）
   - 支持角色权限控制

2. **teams** - 团队表
   - 存储销售团队信息
   - 支持不同等级的团队规模

3. **customers** - 客户表
   - 存储客户基本信息
   - 支持星级评价和归属管理

4. **follow_records** - 跟进记录表
   - 存储客户跟进历史
   - 支持跟进统计分析

5. **operation_logs** - 操作日志表
   - 记录系统重要操作
   - 支持审计追踪

## 权限系统

### 角色定义

- **Admin（系统管理员）**：最高权限，系统全局管理
- **Manager（总经理）**：全局管理权限，业务管理
- **Leader（组长）**：团队管理权限
- **Sales（销售员）**：个人数据权限

### 权限控制

- 基于JWT的身份认证
- 基于角色的访问控制（RBAC）
- 数据级权限隔离

## 开发指南

### 添加新的API接口

1. 在 `src/models/` 中创建数据模型
2. 在 `src/controllers/` 中创建控制器
3. 在 `src/routes/` 中定义路由
4. 在 `server.js` 中注册路由

### 数据验证

使用Joi进行请求数据验证：

```javascript
const { validate } = require('../utils/validation');
const { userSchemas } = require('../utils/validation');

router.post('/users', validate(userSchemas.create), UserController.create);
```

### 错误处理

使用统一的响应格式：

```javascript
const { success, badRequest, serverError } = require('../utils/response');

// 成功响应
res.json(success(data, '操作成功'));

// 错误响应
res.status(400).json(badRequest('参数错误'));
```

## 部署说明

### 生产环境配置

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产数据库连接
3. 设置强密码的JWT_SECRET
4. 配置HTTPS和域名
5. 设置进程管理器（如PM2）

### Docker部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 常见问题

### 数据库连接失败

1. 检查MySQL服务是否启动
2. 验证数据库连接配置
3. 确认数据库用户权限

### JWT Token无效

1. 检查JWT_SECRET配置
2. 验证Token是否过期
3. 确认请求头格式正确

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码变更
4. 创建Pull Request

## 许可证

MIT License 
# 赋优客户服务管理系统 FuYouCSM

## 项目简介

赋优客户服务管理系统（FuYouCSM）是一套现代化的客户关系管理系统，专为销售团队设计，提供完整的客户信息管理、跟进记录追踪、团队协作和数据统计分析功能。

## 系统特色

### 🎯 核心功能
- **客户管理**: 完整的客户信息维护，支持星级评价和客户需求记录
- **跟进记录**: 详细的客户跟进历史，实时状态提醒
- **团队协作**: 多层级权限管理，支持客户转移和团队统计
- **数据分析**: 丰富的统计报表和数据可视化

### 🔐 权限体系
- **总经理**: 全局管理权限，用户管理、团队管理、数据统计
- **组长**: 团队管理权限，本组客户管理和统计
- **销售员**: 个人客户管理和跟进记录

### 💡 技术亮点
- **前端**: React 18 + TypeScript + Ant Design
- **后端**: Node.js + Express + SQLite/MySQL
- **安全**: JWT认证 + 角色权限控制
- **体验**: 响应式设计 + 实时状态更新

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd tscrm
```

2. **安装依赖**
```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **启动后端服务**
```bash
cd backend
npm start
```

4. **启动前端服务**
```bash
cd frontend
npm start
```

5. **访问系统**
- 前端地址: http://localhost:3002
- 后端API: http://localhost:3001
- 默认账号: 13800000000 / 123456

## 项目结构

```
tscrm/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # Redux状态管理
│   │   ├── types/           # TypeScript类型
│   │   └── utils/           # 工具函数
│   └── package.json
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── routes/          # API路由
│   │   ├── config/          # 配置文件
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   ├── data/                # SQLite数据库
│   └── package.json
└── docs/                    # 项目文档
```

## 功能模块

### 👥 用户管理
- 用户增删改查
- 角色权限分配
- 密码管理
- 团队归属设置

### 🏢 团队管理
- 团队创建和编辑
- 成员数量限制
- 组长分配
- 团队统计

### 👤 客户管理
- 客户信息维护
- 星级评价系统
- 客户需求记录
- 归属管理和转移

### 📝 跟进记录
- 跟进内容记录
- 时间轴展示
- 状态可视化
- 提醒功能

### 📊 统计报表
- 客户统计分析
- 跟进数据统计
- 团队绩效报告
- 数据导出功能

## 技术架构

### 前端技术栈
- **React 18**: 现代化前端框架
- **TypeScript**: 类型安全的JavaScript
- **Ant Design**: 企业级UI组件库
- **Redux Toolkit**: 状态管理
- **React Router**: 路由管理

### 后端技术栈
- **Node.js**: JavaScript运行环境
- **Express**: Web应用框架
- **SQLite/MySQL**: 数据库支持
- **JWT**: 身份认证
- **bcrypt**: 密码加密

### 安全特性
- JWT Token认证
- 角色权限控制
- 数据权限隔离
- 密码加密存储
- API访问限制

## 开发指南

### 开发环境配置
1. 配置环境变量文件 `.env`
2. 初始化数据库 `npm run init-db`
3. 启动开发服务器 `npm run dev`

### API文档
- 认证接口: `/api/auth`
- 用户管理: `/api/users`
- 团队管理: `/api/teams`
- 客户管理: `/api/customers`
- 跟进记录: `/api/follow-records`
- 统计报表: `/api/statistics`

### 数据库设计
- 用户表 (users)
- 团队表 (teams)
- 客户表 (customers)
- 跟进记录表 (follow_records)

## 部署说明

### 生产环境部署
1. 构建前端项目: `npm run build`
2. 配置生产环境变量
3. 启动后端服务: `npm start`
4. 配置反向代理 (Nginx)

### Docker部署
```bash
# 构建镜像
docker build -t fuyou-csm .

# 运行容器
docker run -p 3001:3001 fuyou-csm
```

## 更新日志

### v1.0.0 (2024-06-03)
- ✅ 完成基础功能开发
- ✅ 用户权限体系
- ✅ 客户管理功能
- ✅ 跟进记录系统
- ✅ 统计报表功能
- ✅ 客户需求字段支持

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系开发团队。

---

**赋优客户服务管理系统 FuYouCSM** - 让客户管理更简单，让销售更高效！ 
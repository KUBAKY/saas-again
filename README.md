# 健身房多品牌管理SaaS系统

> 🏋️‍♂️ **全栈AI驱动开发** - 现代化健身房管理解决方案

[![AI Powered](https://img.shields.io/badge/AI-Powered-blue.svg)](https://github.com/anthropics/claude)
[![Tech Stack](https://img.shields.io/badge/Stack-NestJS%20%2B%20Vue3-green.svg)](#技术栈)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Development](https://img.shields.io/badge/Development-AI%20Driven-purple.svg)](.ai/README.md)

## 📋 项目概述

健身房多品牌管理SaaS系统是一个现代化的健身房管理平台，支持多品牌、多门店的统一管理。系统采用**全程AI驱动开发**模式，通过人工智能大模型实现高效、高质量的软件开发。

### 🎯 核心功能

#### 🏪 多品牌门店管理
- 品牌信息管理和门店配置
- 统一的运营数据分析
- 跨门店资源调配

#### 👥 会员管理系统
- 会员档案和等级管理
- 智能签到和消费记录
- 个性化服务推荐

#### 💪 课程与教练管理
- 课程安排和预约系统
- 教练资质和排班管理
- 智能匹配推荐

#### 💰 财务与营销
- 多维度财务报表
- 营销活动管理
- 数据驱动决策支持

### 🏗️ 系统架构

```
健身房SaaS系统
├── 会员端小程序          # 微信小程序 (磨砂玻璃风格)
├── 门店端小程序          # 门店管理小程序
├── Web商城              # 在线商城系统
├── Web总部管理后台       # 品牌总部管理系统
└── 后端API服务          # NestJS + PostgreSQL
```

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **PostgreSQL**: >= 14.0
- **Redis**: >= 6.0
- **Docker**: >= 20.0.0 (可选)

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd saas

# 2. 安装依赖
npm install

# 3. 环境配置
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息

# 4. 数据库初始化
npm run db:migrate
npm run db:seed

# 5. 启动开发服务
npm run dev
```

### 🤖 AI开发模式

本项目采用全程AI驱动开发，详细指南请查看：

- 📖 **[AI开发指南](.ai/README.md)** - 完整的AI开发工作流
- 🛠️ **[开发前准备](开发前准备清单.md)** - 环境配置和工具准备
- 📋 **[项目开发指导](项目开发指导文件.md)** - 技术架构和开发规范
- 📝 **[开发规则](rules.md)** - 开发流程和质量标准

#### AI开发快速上手

```bash
# 初始化AI开发环境
./.ai/scripts/ai-workflow.sh init

# 使用AI生成代码
./.ai/scripts/ai-workflow.sh generate user entity
./.ai/scripts/ai-workflow.sh generate user service
./.ai/scripts/ai-workflow.sh generate user controller

# AI代码审查
./.ai/scripts/ai-workflow.sh review src/user/user.service.ts

# 质量检查
./.ai/scripts/ai-workflow.sh quality
```

## 🛠️ 技术栈

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **NestJS** | ^10.0.0 | Node.js框架 |
| **TypeScript** | ^5.0.0 | 类型安全 |
| **PostgreSQL** | ^14.0 | 主数据库 |
| **Redis** | ^6.0 | 缓存和会话 |
| **TypeORM** | ^0.3.0 | ORM框架 |
| **JWT** | ^9.0.0 | 身份认证 |
| **Swagger** | ^7.0.0 | API文档 |

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue 3** | ^3.3.0 | 前端框架 |
| **TypeScript** | ^5.0.0 | 类型安全 |
| **Element Plus** | ^2.4.0 | UI组件库 |
| **Pinia** | ^2.1.0 | 状态管理 |
| **Vue Router** | ^4.2.0 | 路由管理 |
| **Axios** | ^1.5.0 | HTTP客户端 |

### 小程序技术

| 技术 | 版本 | 用途 |
|------|------|------|
| **微信小程序** | 最新 | 原生小程序 |
| **TypeScript** | ^5.0.0 | 类型安全 |
| **Vant Weapp** | ^1.11.0 | UI组件库 |
| **MobX** | ^6.10.0 | 状态管理 |

### AI开发工具

| 工具 | 用途 | 优势 |
|------|------|------|
| **Claude 3.5 Sonnet** | 架构设计、复杂逻辑 | 推理能力强 |
| **GPT-4** | 文档生成、需求分析 | 语言理解好 |
| **GitHub Copilot** | 实时代码补全 | 上下文感知 |
| **Cursor IDE** | AI原生开发环境 | 深度集成 |

## 📁 项目结构

```
saas/
├── .ai/                          # AI开发工具和配置
│   ├── config/                   # AI配置文件
│   ├── prompts/                  # 提示词模板库
│   ├── scripts/                  # 自动化脚本
│   └── README.md                 # AI开发指南
├── backend/                      # 后端服务
│   ├── src/
│   │   ├── auth/                 # 认证模块
│   │   ├── user/                 # 用户管理
│   │   ├── member/               # 会员管理
│   │   ├── store/                # 门店管理
│   │   ├── course/               # 课程管理
│   │   ├── coach/                # 教练管理
│   │   ├── order/                # 订单管理
│   │   ├── payment/              # 支付管理
│   │   ├── notification/         # 通知服务
│   │   └── common/               # 公共模块
│   ├── test/                     # 测试文件
│   ├── docs/                     # API文档
│   └── package.json
├── frontend/                     # Web前端
│   ├── src/
│   │   ├── views/                # 页面组件
│   │   ├── components/           # 公共组件
│   │   ├── stores/               # 状态管理
│   │   ├── router/               # 路由配置
│   │   ├── api/                  # API接口
│   │   └── utils/                # 工具函数
│   └── package.json
├── miniprogram-member/           # 会员端小程序
│   ├── pages/                    # 页面
│   ├── components/               # 组件
│   ├── utils/                    # 工具函数
│   ├── stores/                   # 状态管理
│   └── app.json
├── miniprogram-store/            # 门店端小程序
│   ├── pages/                    # 页面
│   ├── components/               # 组件
│   ├── utils/                    # 工具函数
│   └── app.json
├── web-store/                    # Web商城
│   ├── src/
│   │   ├── views/                # 页面组件
│   │   ├── components/           # 公共组件
│   │   └── stores/               # 状态管理
│   └── package.json
├── docs/                         # 项目文档
│   ├── api/                      # API文档
│   ├── design/                   # 设计文档
│   └── deployment/               # 部署文档
├── scripts/                      # 构建脚本
├── docker/                       # Docker配置
├── 项目开发指导文件.md             # 开发指导
├── 开发前准备清单.md               # 准备清单
├── rules.md                      # 开发规则
├── AI驱动开发指南.md               # AI开发指南
└── README.md                     # 项目说明
```

## 🎨 设计规范

### UI设计风格

#### 磨砂玻璃风格（小程序）
```css
/* 磨砂玻璃效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

#### 色彩规范
- **主色调**: `#667eea` (渐变蓝)
- **辅助色**: `#764ba2` (渐变紫)
- **成功色**: `#67C23A`
- **警告色**: `#E6A23C`
- **错误色**: `#F56C6C`
- **信息色**: `#909399`

### 响应式设计
- **移动端优先**: 小程序和H5适配
- **桌面端**: 1200px+ 宽屏设计
- **平板端**: 768px-1199px 适配

## 🔐 安全规范

### 身份认证
- JWT Token认证
- 刷新Token机制
- 多端登录控制

### 数据安全
- 敏感数据加密存储
- API接口权限控制
- SQL注入防护
- XSS攻击防护

### 隐私保护
- 个人信息脱敏
- 数据访问日志
- GDPR合规性

## 📊 性能指标

### 后端性能
- **响应时间**: < 200ms (95%)
- **并发处理**: > 1000 QPS
- **可用性**: > 99.9%
- **数据库**: 查询优化，索引覆盖

### 前端性能
- **首屏加载**: < 2s
- **页面切换**: < 500ms
- **包体积**: < 2MB
- **Lighthouse评分**: > 90

### 小程序性能
- **启动时间**: < 3s
- **页面渲染**: < 1s
- **包体积**: < 2MB
- **内存使用**: < 50MB

## 🧪 测试策略

### 测试覆盖率
- **单元测试**: > 80%
- **集成测试**: > 70%
- **E2E测试**: 核心流程100%

### 测试工具
- **后端**: Jest + Supertest
- **前端**: Vitest + Testing Library
- **E2E**: Playwright
- **性能**: Artillery + Lighthouse

### AI辅助测试
```bash
# AI生成测试用例
./.ai/scripts/ai-workflow.sh test src/member/member.service.ts unit

# AI生成集成测试
./.ai/scripts/ai-workflow.sh test src/member/ integration

# AI性能测试建议
./.ai/scripts/ai-workflow.sh performance src/member/
```

## 🚀 部署方案

### 开发环境
```bash
# 本地开发
npm run dev

# Docker开发环境
docker-compose up -d
```

### 测试环境
```bash
# 构建测试镜像
npm run build:test
docker build -t saas:test .

# 部署到测试环境
kubectl apply -f k8s/test/
```

### 生产环境
```bash
# 构建生产镜像
npm run build:prod
docker build -t saas:prod .

# 部署到生产环境
kubectl apply -f k8s/prod/
```

### CI/CD流程
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: AI Code Review
        run: ./.ai/scripts/ai-workflow.sh review
      - name: Run Tests
        run: npm test
      - name: Build & Deploy
        run: npm run deploy
```

## 📈 监控与运维

### 应用监控
- **APM**: New Relic / DataDog
- **日志**: ELK Stack
- **指标**: Prometheus + Grafana
- **告警**: PagerDuty

### 业务监控
- **用户行为**: Google Analytics
- **错误追踪**: Sentry
- **性能监控**: Web Vitals
- **可用性**: Uptime Robot

## 🤝 开发协作

### Git工作流
```bash
# 功能开发
git checkout -b feature/member-management
git commit -m "feat: 实现会员管理功能"
git push origin feature/member-management

# AI辅助提交信息
./.ai/scripts/ai-workflow.sh commit
```

### 代码审查
- **AI预审**: 自动代码质量检查
- **人工审查**: 业务逻辑和架构审查
- **安全审查**: 安全漏洞扫描

### 团队协作
- **需求管理**: Jira / Linear
- **文档协作**: Notion / Confluence
- **沟通工具**: Slack / 企业微信
- **设计协作**: Figma

## 📚 学习资源

### 技术文档
- 📖 [NestJS官方文档](https://nestjs.com/)
- 📖 [Vue 3官方文档](https://vuejs.org/)
- 📖 [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- 📖 [PostgreSQL文档](https://www.postgresql.org/docs/)

### AI开发学习
- 🤖 [AI开发指南](.ai/README.md)
- 📝 [Prompt Engineering](https://www.promptingguide.ai/)
- 🛠️ [GitHub Copilot最佳实践](https://docs.github.com/en/copilot)
- 🎯 [Claude API文档](https://docs.anthropic.com/)

### 最佳实践
- 🏗️ [系统架构设计](docs/architecture/)
- 🔒 [安全开发规范](docs/security/)
- 🧪 [测试驱动开发](docs/testing/)
- 🚀 [DevOps实践](docs/devops/)

## 🐛 问题反馈

### 报告Bug
1. 在GitHub Issues中创建新issue
2. 使用Bug报告模板
3. 提供详细的复现步骤
4. 附上相关的日志和截图

### 功能建议
1. 在GitHub Discussions中发起讨论
2. 描述功能需求和使用场景
3. 提供设计思路和实现建议

### 技术支持
- 📧 **邮箱**: tech-support@company.com
- 💬 **Slack**: #tech-support
- 📞 **电话**: 400-xxx-xxxx

## 🏆 贡献指南

### 如何贡献

1. **Fork项目**
   ```bash
   git clone https://github.com/your-username/saas.git
   cd saas
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **使用AI辅助开发**
   ```bash
   # 使用AI生成代码
   ./.ai/scripts/ai-workflow.sh generate your-feature
   
   # AI代码审查
   ./.ai/scripts/ai-workflow.sh review src/your-feature/
   ```

4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature/your-feature-name
   ```

5. **创建Pull Request**
   - 使用PR模板
   - 详细描述更改内容
   - 确保所有检查通过

### 贡献类型
- 🐛 **Bug修复**
- ✨ **新功能开发**
- 📝 **文档改进**
- 🎨 **UI/UX优化**
- ⚡ **性能优化**
- 🧪 **测试用例**
- 🤖 **AI提示词优化**

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目和服务：

- [NestJS](https://nestjs.com/) - 强大的Node.js框架
- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [PostgreSQL](https://www.postgresql.org/) - 世界上最先进的开源数据库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- [Claude](https://www.anthropic.com/) - AI开发助手
- [GitHub Copilot](https://github.com/features/copilot) - AI代码补全

## 📞 联系我们

- 🌐 **官网**: https://saas.company.com
- 📧 **邮箱**: contact@company.com
- 💬 **微信**: saas-support
- 📱 **QQ群**: 123456789
- 🐦 **Twitter**: @saas_system

---

**🎉 让我们一起用AI的力量构建更好的健身房管理系统！**

---

*最后更新: 2024年1月1日*  
*版本: v1.0.0*  
*维护者: AI开发团队*
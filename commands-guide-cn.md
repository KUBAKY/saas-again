# SuperClaude 命令指南 🚀
# SuperClaude Commands Guide 🚀

## 快速参考表 📋
## Quick Reference Table 📋

| 命令 | 用途 | 最佳使用场景 |
| Command | Purpose | Best For |
|---------|---------|-------------|
| `/sc:index` | 命令导航 | 查找合适的命令 |
| `/sc:index` | Command navigation | Finding the right command |
| `/sc:analyze` | 代码分析 | 理解代码库、发现问题 |
| `/sc:analyze` | Code analysis | Understanding codebases, finding issues |
| `/sc:implement` | 智能实现 | 构建功能、修复bug |
| `/sc:implement` | Smart implementation | Building features, fixing bugs |
| `/sc:workflow` | 工作流程自动化 | 复杂的多步骤任务 |
| `/sc:workflow` | Workflow automation | Complex multi-step tasks |
| `/sc:build` | 构建操作 | 编译、打包、部署 |
| `/sc:build` | Build operations | Compiling, bundling, deploying |
| `/sc:design` | 架构设计 | 系统设计、重构 |
| `/sc:design` | Architecture design | System design, refactoring |
| `/sc:troubleshoot` | 问题诊断 | 调试错误、性能问题 |
| `/sc:troubleshoot` | Problem diagnosis | Debugging errors, performance issues |
| `/sc:explain` | 代码解释 | 理解复杂代码 |
| `/sc:explain` | Code explanation | Understanding complex code |
| `/sc:improve` | 代码改进 | 重构、优化 |
| `/sc:improve` | Code improvement | Refactoring, optimization |
| `/sc:cleanup` | 代码清理 | 移除死代码、格式化 |
| `/sc:cleanup` | Code cleanup | Removing dead code, formatting |
| `/sc:test` | 测试操作 | 运行测试、生成测试 |
| `/sc:test` | Testing operations | Running tests, generating tests |
| `/sc:document` | 文档生成 | 创建文档、注释 |
| `/sc:document` | Documentation | Creating docs, comments |
| `/sc:estimate` | 项目估算 | 时间估算、复杂度分析 |
| `/sc:estimate` | Project estimation | Time estimates, complexity analysis |
| `/sc:task` | 任务管理 | 项目规划、任务分解 |
| `/sc:task` | Task management | Project planning, task breakdown |
| `/sc:spawn` | 复杂编排 | 多步骤工作流程 |
| `/sc:spawn` | Complex orchestration | Multi-step workflows |
| `/sc:git` | Git操作 | 版本控制、分支管理 |
| `/sc:git` | Git operations | Version control, branch management |
| `/sc:load` | 项目上下文 | 项目理解、入门 |
| `/sc:load` | Project context | Project understanding, onboarding |

## 快速尝试这些命令 ⚡
## Quick Try These ⚡

**如果你只想快速开始，试试这些：**
**If you just want to get started quickly, try these:**

```bash
/sc:index                          # 查看所有可用命令
/sc:index                          # See all available commands
/sc:analyze                        # 分析当前项目
/sc:analyze                        # Analyze current project
/sc:implement "添加用户认证"        # 构建功能
/sc:implement "add user auth"      # Build a feature
```

## 开发命令 🛠️
## Development Commands 🛠️

### `/sc:workflow` - 工作流程自动化
### `/sc:workflow` - Workflow Automation
**功能**：自动化复杂的开发工作流程和多步骤任务。
**What it does**: Automates complex development workflows and multi-step tasks.

**何时使用**：
**When to use it**:
- 设置新项目或功能
- Setting up new projects or features
- 需要多个步骤的复杂任务
- Complex tasks requiring multiple steps
- 重复的开发流程
- Repetitive development processes
- 团队入门流程
- Team onboarding processes

**基本语法**：
**Basic syntax**:
```bash
/sc:workflow setup-react-project    # 设置React项目
/sc:workflow setup-react-project    # Set up React project
/sc:workflow add-auth-system        # 添加认证系统
/sc:workflow add-auth-system        # Add authentication system
/sc:workflow deploy-to-staging      # 部署到测试环境
/sc:workflow deploy-to-staging      # Deploy to staging
```

**有用的标志**：
**Useful flags**:
- `--interactive` - 交互模式，逐步确认
- `--interactive` - Interactive mode with step-by-step confirmation
- `--preview` - 预览将要执行的步骤
- `--preview` - Preview steps that would be executed
- `--template <name>` - 使用预定义模板
- `--template <name>` - Use predefined template

**实际示例**：
**Real examples**:
```bash
/sc:workflow setup-nextjs-app --interactive
/sc:workflow add-database-layer --preview
/sc:workflow "create user dashboard" --template crud
```

**注意事项**：
**Gotchas**:
- 对于复杂工作流程效果最佳
- Works best for well-defined workflows
- 可能需要一些手动调整
- May require some manual tweaking
- 在大型项目中保存时间
- Saves time on larger projects

---

### `/sc:implement` - 智能实现
### `/sc:implement` - Smart Implementation
**功能**：智能代码生成和功能实现，具有上下文感知能力。
**What it does**: Intelligent code generation and feature implementation with context awareness.

**何时使用**：
**When to use it**:
- 构建新功能
- Building new features
- 修复特定bug
- Fixing specific bugs
- 添加API端点
- Adding API endpoints
- 实现算法
- Implementing algorithms

**基本语法**：
**Basic syntax**:
```bash
/sc:implement "用户认证系统"         # 功能描述
/sc:implement "user authentication" # Feature description
/sc:implement fix-login-bug         # Bug修复
/sc:implement fix-login-bug         # Bug fix
/sc:implement --file auth.js "添加JWT支持"
/sc:implement --file auth.js "add JWT support"
```

**有用的标志**：
**Useful flags**:
- `--file <path>` - 针对特定文件
- `--file <path>` - Target specific file
- `--test` - 同时生成测试
- `--test` - Generate tests alongside
- `--safe` - 保守实现（较少更改）
- `--safe` - Conservative implementation (fewer changes)
- `--preview` - 显示将要进行的更改
- `--preview` - Show what changes would be made

**实际示例**：
**Real examples**:
```bash
/sc:implement "添加密码重置功能" --test
/sc:implement "add password reset" --test
/sc:implement --file components/Header.js "添加搜索栏"
/sc:implement --file components/Header.js "add search bar"
/sc:implement fix-memory-leak --safe
```

**注意事项**：
**Gotchas**:
- 在明确定义的任务上效果最佳
- Works best with well-defined tasks
- 可能需要一些调整
- May need some tweaking
- 使用 `--preview` 查看大的更改
- Use `--preview` for big changes

---

### `/sc:build` - 构建操作
### `/sc:build` - Build Operations
**功能**：处理编译、打包、部署和构建相关任务。
**What it does**: Handles compilation, bundling, deployment, and build-related tasks.

**何时使用**：
**When to use it**:
- 编译项目
- Compiling projects
- 创建生产构建
- Creating production builds
- 部署应用
- Deploying applications
- 优化资源
- Optimizing assets

**基本语法**：
**Basic syntax**:
```bash
/sc:build                          # 标准构建
/sc:build                          # Standard build
/sc:build --type prod              # 生产构建
/sc:build --type prod              # Production build
/sc:build --deploy staging         # 构建并部署
/sc:build --deploy staging         # Build and deploy
```

**有用的标志**：
**Useful flags**:
- `--type <env>` - 构建类型（dev/prod/test）
- `--type <env>` - Build type (dev/prod/test)
- `--optimize` - 启用优化
- `--optimize` - Enable optimizations
- `--deploy <target>` - 构建后部署
- `--deploy <target>` - Deploy after building
- `--watch` - 监视模式
- `--watch` - Watch mode

**实际示例**：
**Real examples**:
```bash
/sc:build --type prod --optimize
/sc:build --deploy heroku --type prod
/sc:build --watch --type dev
```

**注意事项**：
**Gotchas**:
- 需要正确的构建配置
- Requires proper build configuration
- 检查构建工具是否在PATH中
- Check that build tools are in PATH
- 生产构建可能需要时间
- Production builds can take time

---

### `/sc:design` - 架构设计
### `/sc:design` - Architecture Design
**功能**：帮助进行系统架构、设计模式和代码结构决策。
**What it does**: Helps with system architecture, design patterns, and code structure decisions.

**何时使用**：
**When to use it**:
- 规划新功能架构
- Planning architecture for new features
- 重构现有代码
- Refactoring existing code
- 选择设计模式
- Choosing design patterns
- 系统设计决策
- System design decisions

**基本语法**：
**Basic syntax**:
```bash
/sc:design "微服务架构"             # 架构规划
/sc:design "microservice architecture" # Architecture planning
/sc:design --refactor auth-module   # 重构建议
/sc:design --refactor auth-module   # Refactoring suggestions
/sc:design --pattern observer       # 设计模式建议
/sc:design --pattern observer       # Design pattern suggestions
```

**有用的标志**：
**Useful flags**:
- `--refactor` - 重构建议
- `--refactor` - Refactoring suggestions
- `--pattern <name>` - 特定设计模式
- `--pattern <name>` - Specific design pattern
- `--scalability` - 关注可扩展性
- `--scalability` - Focus on scalability
- `--performance` - 关注性能
- `--performance` - Focus on performance

**实际示例**：
**Real examples**:
```bash
/sc:design "电商购物车系统" --scalability
/sc:design "e-commerce cart system" --scalability
/sc:design --refactor user-service --performance
/sc:design --pattern factory "用户创建系统"
/sc:design --pattern factory "user creation system"
```

**注意事项**：
**Gotchas**:
- 提供高级指导，不是具体代码
- Provides high-level guidance, not specific code
- 最适合架构决策
- Best for architectural decisions
- 结合其他命令使用以实现
- Combine with other commands for implementation

## 分析命令 🔍
## Analysis Commands 🔍

### `/sc:analyze` - 代码分析
### `/sc:analyze` - Code Analysis
**功能**：深度代码分析，包括质量、安全性、性能和架构洞察。
**What it does**: Deep code analysis including quality, security, performance, and architecture insights.

**何时使用**：
**When to use it**:
- 理解新代码库
- Understanding new codebases
- 代码审查
- Code reviews
- 发现潜在问题
- Finding potential issues
- 性能瓶颈识别
- Performance bottleneck identification

**基本语法**：
**Basic syntax**:
```bash
/sc:analyze                        # 分析当前目录
/sc:analyze                        # Analyze current directory
/sc:analyze src/components/        # 分析特定目录
/sc:analyze src/components/        # Analyze specific directory
/sc:analyze --focus security       # 专注安全分析
/sc:analyze --focus security       # Focus on security analysis
```

**有用的标志**：
**Useful flags**:
- `--focus <area>` - 专注特定领域（security/performance/quality/architecture）
- `--focus <area>` - Focus on specific area (security/performance/quality/architecture)
- `--depth <level>` - 分析深度（quick/normal/deep）
- `--depth <level>` - Analysis depth (quick/normal/deep)
- `--format <type>` - 输出格式（summary/detailed/json）
- `--format <type>` - Output format (summary/detailed/json)

**实际示例**：
**Real examples**:
```bash
/sc:analyze --focus performance --depth deep
/sc:analyze src/api/ --focus security
/sc:analyze --format summary
```

**注意事项**：
**Gotchas**:
- 深度分析可能需要时间
- Deep analysis can take time
- 在大型项目上使用 `--focus` 来缩小范围
- Use `--focus` to narrow scope on large projects
- 结果质量取决于代码质量
- Results quality depends on code quality

---

### `/sc:troubleshoot` - 问题诊断
### `/sc:troubleshoot` - Problem Diagnosis
**功能**：诊断错误、性能问题和系统故障。
**What it does**: Diagnoses errors, performance issues, and system failures.

**何时使用**：
**When to use it**:
- 调试神秘错误
- Debugging mysterious errors
- 性能问题
- Performance problems
- 构建失败
- Build failures
- 运行时错误
- Runtime errors

**基本语法**：
**Basic syntax**:
```bash
/sc:troubleshoot "TypeError: Cannot read property"
/sc:troubleshoot --logs error.log  # 分析日志文件
/sc:troubleshoot --logs error.log  # Analyze log files
/sc:troubleshoot --performance     # 性能诊断
/sc:troubleshoot --performance     # Performance diagnosis
```

**有用的标志**：
**Useful flags**:
- `--logs <file>` - 分析特定日志文件
- `--logs <file>` - Analyze specific log files
- `--performance` - 专注性能问题
- `--performance` - Focus on performance issues
- `--stack-trace` - 包含堆栈跟踪分析
- `--stack-trace` - Include stack trace analysis
- `--environment` - 检查环境问题
- `--environment` - Check environment issues

**实际示例**：
**Real examples**:
```bash
/sc:troubleshoot "内存泄漏" --performance
/sc:troubleshoot "memory leak" --performance
/sc:troubleshoot --logs app.log --stack-trace
/sc:troubleshoot "构建失败" --environment
/sc:troubleshoot "build failing" --environment
```

**注意事项**：
**Gotchas**:
- 提供具体的错误消息以获得更好的结果
- Provide specific error messages for better results
- 包含相关日志和上下文
- Include relevant logs and context
- 可能建议多个解决方案
- May suggest multiple solutions

---

### `/sc:explain` - 代码解释
### `/sc:explain` - Code Explanation
**功能**：解释复杂代码、算法和架构决策。
**What it does**: Explains complex code, algorithms, and architectural decisions.

**何时使用**：
**When to use it**:
- 理解遗留代码
- Understanding legacy code
- 学习新算法
- Learning new algorithms
- 代码审查
- Code reviews
- 团队知识分享
- Team knowledge sharing

**基本语法**：
**Basic syntax**:
```bash
/sc:explain src/utils/algorithm.js # 解释特定文件
/sc:explain src/utils/algorithm.js # Explain specific file
/sc:explain --function quickSort   # 解释特定函数
/sc:explain --function quickSort   # Explain specific function
/sc:explain --concept "依赖注入"    # 解释概念
/sc:explain --concept "dependency injection" # Explain concept
```

**有用的标志**：
**Useful flags**:
- `--function <name>` - 解释特定函数
- `--function <name>` - Explain specific function
- `--concept <topic>` - 解释编程概念
- `--concept <topic>` - Explain programming concept
- `--simple` - 简化解释
- `--simple` - Simplified explanation
- `--detailed` - 详细解释
- `--detailed` - Detailed explanation

**实际示例**：
**Real examples**:
```bash
/sc:explain --function authenticateUser --detailed
/sc:explain src/components/DataTable.js --simple
/sc:explain --concept "React hooks" --simple
```

**注意事项**：
**Gotchas**:
- 在复杂代码上效果最佳
- Works best on complex code
- 使用 `--simple` 进行快速概述
- Use `--simple` for quick overviews
- 非常适合学习和文档编制
- Great for learning and documentation

## 质量命令 ✨
## Quality Commands ✨

### `/sc:improve` - 代码改进
### `/sc:improve` - Code Improvement
**功能**：智能代码重构、优化和质量改进。
**What it does**: Intelligent code refactoring, optimization, and quality improvements.

**何时使用**：
**When to use it**:
- 重构遗留代码
- Refactoring legacy code
- 性能优化
- Performance optimization
- 代码质量提升
- Code quality enhancement
- 现代化旧代码
- Modernizing old code

**基本语法**：
**Basic syntax**:
```bash
/sc:improve src/components/        # 改进目录
/sc:improve src/components/        # Improve directory
/sc:improve --file legacy.js       # 改进特定文件
/sc:improve --file legacy.js       # Improve specific file
/sc:improve --focus performance    # 专注性能
/sc:improve --focus performance    # Focus on performance
```

**有用的标志**：
**Useful flags**:
- `--focus <area>` - 专注特定改进领域
- `--focus <area>` - Focus on specific improvement area
- `--safe` - 仅进行安全更改
- `--safe` - Only make safe changes
- `--preview` - 预览更改
- `--preview` - Preview changes
- `--aggressive` - 更激进的重构
- `--aggressive` - More aggressive refactoring

**实际示例**：
**Real examples**:
```bash
/sc:improve --focus readability --safe
/sc:improve src/api/ --preview
/sc:improve --file utils.js --aggressive
```

**注意事项**：
**Gotchas**:
- 始终先使用 `--preview`
- Always use `--preview` first
- `--safe` 进行保守更改
- `--safe` for conservative changes
- 在大型更改后测试
- Test after large changes

---

### `/sc:cleanup` - 代码清理
### `/sc:cleanup` - Code Cleanup
**功能**：移除死代码、格式化和清理代码库。
**What it does**: Removes dead code, formats, and cleans up codebases.

**何时使用**：
**When to use it**:
- 移除未使用的代码
- Removing unused code
- 格式化不一致的代码
- Formatting inconsistent code
- 清理导入
- Cleaning up imports
- 代码库维护
- Codebase maintenance

**基本语法**：
**Basic syntax**:
```bash
/sc:cleanup                        # 清理当前目录
/sc:cleanup                        # Clean current directory
/sc:cleanup --dead-code            # 仅移除死代码
/sc:cleanup --dead-code            # Remove dead code only
/sc:cleanup --format               # 仅格式化
/sc:cleanup --format               # Format only
```

**有用的标志**：
**Useful flags**:
- `--dead-code` - 移除未使用的代码
- `--dead-code` - Remove unused code
- `--format` - 格式化代码
- `--format` - Format code
- `--imports` - 清理导入语句
- `--imports` - Clean up imports
- `--safe` - 保守清理
- `--safe` - Conservative cleanup

**实际示例**：
**Real examples**:
```bash
/sc:cleanup --dead-code --safe
/sc:cleanup src/components/ --format
/sc:cleanup --imports
```

**注意事项**：
**Gotchas**:
- 使用 `--safe` 避免破坏性更改
- Use `--safe` to avoid breaking changes
- 清理后运行测试
- Run tests after cleanup
- 可能需要手动验证
- May need manual verification

---

### `/sc:test` - 测试操作
### `/sc:test` - Testing Operations
**功能**：运行测试、生成测试和测试分析。
**What it does**: Runs tests, generates tests, and provides testing analysis.

**何时使用**：
**When to use it**:
- 运行测试套件
- Running test suites
- 生成缺失的测试
- Generating missing tests
- 测试覆盖率分析
- Test coverage analysis
- 调试测试失败
- Debugging test failures

**基本语法**：
**Basic syntax**:
```bash
/sc:test                           # 运行所有测试
/sc:test                           # Run all tests
/sc:test --generate src/utils.js   # 为文件生成测试
/sc:test --generate src/utils.js   # Generate tests for file
/sc:test --coverage                # 运行覆盖率报告
/sc:test --coverage                # Run with coverage report
```

**有用的标志**：
**Useful flags**:
- `--generate` - 生成缺失的测试
- `--generate` - Generate missing tests
- `--coverage` - 包含覆盖率报告
- `--coverage` - Include coverage report
- `--type <type>` - 特定测试类型（unit/integration/e2e）
- `--type <type>` - Specific test type (unit/integration/e2e)
- `--watch` - 监视模式
- `--watch` - Watch mode

**实际示例**：
**Real examples**:
```bash
/sc:test --type unit --coverage
/sc:test --generate src/api/ --type integration
/sc:test --watch
```

**注意事项**：
**Gotchas**:
- 需要配置测试框架
- Requires test framework setup
- 生成的测试可能需要调整
- Generated tests may need tweaking
- 覆盖率报告很有用
- Coverage reports are helpful

## 文档命令 📚
## Documentation Commands 📚

### `/sc:document` - 文档生成
### `/sc:document` - Documentation Generation
**功能**：生成文档、注释和API文档。
**What it does**: Generates documentation, comments, and API docs.

**何时使用**：
**When to use it**:
- 创建项目文档
- Creating project documentation
- 生成API文档
- Generating API documentation
- 添加代码注释
- Adding code comments
- 创建README文件
- Creating README files

**基本语法**：
**Basic syntax**:
```bash
/sc:document                       # 文档化当前项目
/sc:document                       # Document current project
/sc:document --type api            # 生成API文档
/sc:document --type api            # Generate API docs
/sc:document README                # 创建README
/sc:document README                # Create README
```

**有用的标志**：
**Useful flags**:
- `--type <type>` - 文档类型（api/guide/reference）
- `--type <type>` - Documentation type (api/guide/reference)
- `--format <fmt>` - 输出格式（markdown/html/json）
- `--format <fmt>` - Output format (markdown/html/json)
- `--comments` - 添加内联注释
- `--comments` - Add inline comments

**实际示例**：
**Real examples**:
```bash
/sc:document --type api --format markdown
/sc:document src/components/ --comments
/sc:document --type guide README
```

**注意事项**：
**Gotchas**:
- 在良好结构的代码上效果最佳
- Works best on well-structured code
- 可能需要手动编辑
- May need manual editing
- API文档需要良好的类型定义
- API docs need good type definitions

## 项目管理命令 📊
## Project Management Commands 📊

### `/sc:estimate` - 项目估算
### `/sc:estimate` - Project Estimation
**功能**：提供时间估算、复杂度分析和项目规划洞察。
**What it does**: Provides time estimates, complexity analysis, and project planning insights.

**何时使用**：
**When to use it**:
- 项目规划
- Project planning
- 功能估算
- Feature estimation
- 资源分配
- Resource allocation
- 截止日期规划
- Deadline planning

**基本语法**：
**Basic syntax**:
```bash
/sc:estimate "用户认证系统"         # 估算功能
/sc:estimate "user auth system"    # Estimate feature
/sc:estimate --project             # 估算整个项目
/sc:estimate --project             # Estimate entire project
/sc:estimate --complexity src/     # 复杂度分析
/sc:estimate --complexity src/     # Complexity analysis
```

**有用的标志**：
**Useful flags**:
- `--project` - 整个项目估算
- `--project` - Whole project estimation
- `--complexity` - 复杂度分析
- `--complexity` - Complexity analysis
- `--breakdown` - 详细分解
- `--breakdown` - Detailed breakdown
- `--team-size <n>` - 考虑团队规模
- `--team-size <n>` - Consider team size

**实际示例**：
**Real examples**:
```bash
/sc:estimate "电商购物车" --breakdown
/sc:estimate "e-commerce cart" --breakdown
/sc:estimate --project --team-size 3
/sc:estimate --complexity src/api/
```

**注意事项**：
**Gotchas**:
- 估算是近似值，不是承诺
- Estimates are approximations, not commitments
- 考虑团队经验
- Consider team experience
- 包含测试和文档时间
- Include testing and documentation time

---

### `/sc:task` - 任务管理
### `/sc:task` - Task Management
**功能**：将项目分解为任务、创建待办事项和管理工作流程。
**What it does**: Breaks down projects into tasks, creates todos, and manages workflows.

**何时使用**：
**When to use it**:
- 项目规划
- Project planning
- 任务分解
- Task breakdown
- 工作流程管理
- Workflow management
- 团队协调
- Team coordination

**基本语法**：
**Basic syntax**:
```bash
/sc:task "构建用户仪表板"           # 分解功能
/sc:task "build user dashboard"    # Break down feature
/sc:task --list                    # 列出当前任务
/sc:task --list                    # List current tasks
/sc:task --priority high           # 高优先级任务
/sc:task --priority high           # High priority tasks
```

**有用的标志**：
**Useful flags**:
- `--list` - 列出现有任务
- `--list` - List existing tasks
- `--priority <level>` - 设置优先级
- `--priority <level>` - Set priority level
- `--assign <person>` - 分配任务
- `--assign <person>` - Assign tasks
- `--timeline` - 包含时间线
- `--timeline` - Include timeline

**实际示例**：
**Real examples**:
```bash
/sc:task "API重构" --priority high --timeline
/sc:task "API refactor" --priority high --timeline
/sc:task --list --priority medium
/sc:task "前端优化" --assign frontend-team
/sc:task "frontend optimization" --assign frontend-team
```

**注意事项**：
**Gotchas**:
- 最适合明确定义的项目
- Works best with well-defined projects
- 与团队工具集成
- Integrate with team tools
- 定期更新任务状态
- Update task status regularly

---

### `/sc:spawn` - 复杂编排
### `/sc:spawn` - Complex Orchestration
**功能**：编排复杂的多步骤操作和工作流程。
**What it does**: Orchestrates complex multi-step operations and workflows.

**何时使用**：
**When to use it**:
- 复杂的部署流程
- Complex deployment pipelines
- 多步骤设置过程
- Multi-step setup processes
- 数据迁移
- Data migrations
- 环境配置
- Environment configuration

**基本语法**：
**Basic syntax**:
```bash
/sc:spawn setup-production-env     # 复杂设置
/sc:spawn setup-production-env     # Complex setup
/sc:spawn --parallel migrate-data  # 并行数据迁移
/sc:spawn --parallel migrate-data  # Parallel data migration
/sc:spawn setup-dev-environment    # 复杂环境设置
/sc:spawn setup-dev-environment    # Complex environment setup
```

**有用的标志**：
**Useful flags**:
- `--parallel` - 尽可能并行运行操作
- `--parallel` - Run operations in parallel when possible
- `--sequential` - 强制顺序执行
- `--sequential` - Force sequential execution
- `--monitor` - 监控操作进度
- `--monitor` - Monitor operation progress

**实际示例**：
**Real examples**:
```bash
/sc:spawn --parallel "测试并部署到测试环境"
/sc:spawn --parallel "test and deploy to staging"
/sc:spawn setup-ci-cd --monitor
/sc:spawn --sequential database-migration
```

**注意事项**：
**Gotchas**:
- 最复杂的命令 - 预期一些粗糙的边缘
- Most complex command - expect some rough edges
- 更适合明确定义的工作流程而非临时操作
- Better for well-defined workflows than ad-hoc operations
- 可能需要多次迭代才能正确
- May need multiple iterations to get right

## 版本控制命令 🔄
## Version Control Commands 🔄

### `/git` - 增强的Git操作
### `/git` - Enhanced Git Operations
**功能**：具有智能提交消息和工作流程优化的Git操作。
**What it does**: Git operations with intelligent commit messages and workflow optimization.

**何时使用**：
**When to use it**:
- 使用更好的消息进行提交
- Making commits with better messages
- 分支管理
- Branch management
- 复杂的git工作流程
- Complex git workflows
- Git故障排除
- Git troubleshooting

**基本语法**：
**Basic syntax**:
```bash
/sc:git commit                     # 自动生成消息的智能提交
/sc:git commit                     # Smart commit with auto-generated message
/sc:git --smart-commit add .       # 添加并使用智能消息提交
/sc:git --smart-commit add .       # Add and commit with smart message
/sc:git branch feature/new-auth    # 创建并切换到新分支
/sc:git branch feature/new-auth    # Create and switch to new branch
```

**有用的标志**：
**Useful flags**:
- `--smart-commit` - 生成智能提交消息
- `--smart-commit` - Generate intelligent commit messages
- `--branch-strategy` - 应用分支命名约定
- `--branch-strategy` - Apply branch naming conventions
- `--interactive` - 复杂操作的交互模式
- `--interactive` - Interactive mode for complex operations

**实际示例**：
**Real examples**:
```bash
/sc:git --smart-commit "修复登录bug"
/sc:git --smart-commit "fixed login bug"
/sc:git branch feature/user-dashboard --branch-strategy
/sc:git merge develop --interactive
```

**注意事项**：
**Gotchas**:
- 智能提交消息相当不错，但要审查它们
- Smart commit messages are pretty good but review them
- 假设你遵循常见的git工作流程
- Assumes you're following common git workflows
- 不会修复糟糕的git习惯 - 只是让它们更容易
- Won't fix bad git habits - just makes them easier

## 实用命令 🔧
## Utility Commands 🔧

### `/index` - 命令导航
### `/index` - Command Navigation
**功能**：帮助你找到适合任务的正确命令。
**What it does**: Helps you find the right command for your task.

**何时使用**：
**When to use it**:
- 不确定使用哪个命令
- Not sure which command to use
- 探索可用命令
- Exploring available commands
- 了解命令功能
- Learning about command capabilities

**基本语法**：
**Basic syntax**:
```bash
/sc:index                          # 列出所有命令
/sc:index                          # List all commands
/sc:index testing                  # 查找与测试相关的命令
/sc:index testing                  # Find commands related to testing
/sc:index --category analysis      # 分析类别中的命令
/sc:index --category analysis      # Commands in analysis category
```

**有用的标志**：
**Useful flags**:
- `--category <cat>` - 按命令类别过滤
- `--category <cat>` - Filter by command category
- `--search <term>` - 搜索命令描述
- `--search <term>` - Search command descriptions

**实际示例**：
**Real examples**:
```bash
/sc:index --search "性能"
/sc:index --search "performance"
/sc:index --category quality
/sc:index git
```

**注意事项**：
**Gotchas**:
- 简单但对发现很有用
- Simple but useful for discovery
- 比试图记住所有16个命令更好
- Better than trying to remember all 16 commands

---

### `/load` - 项目上下文加载
### `/load` - Project Context Loading
**功能**：加载和分析项目上下文以更好地理解。
**What it does**: Loads and analyzes project context for better understanding.

**何时使用**：
**When to use it**:
- 开始处理不熟悉的项目
- Starting work on unfamiliar project
- 需要理解项目结构
- Need to understand project structure
- 进行重大更改之前
- Before making major changes
- 团队成员入门
- Onboarding team members

**基本语法**：
**Basic syntax**:
```bash
/sc:load                           # 加载当前项目上下文
/sc:load                           # Load current project context
/sc:load src/                      # 加载特定目录上下文
/sc:load src/                      # Load specific directory context
/sc:load --deep                    # 项目结构的深度分析
/sc:load --deep                    # Deep analysis of project structure
```

**有用的标志**：
**Useful flags**:
- `--deep` - 全面的项目分析
- `--deep` - Comprehensive project analysis
- `--focus <area>` - 专注于特定项目领域
- `--focus <area>` - Focus on specific project area
- `--summary` - 生成项目摘要
- `--summary` - Generate project summary

**实际示例**：
**Real examples**:
```bash
/sc:load --deep --summary
/sc:load src/components/ --focus architecture
/sc:load . --focus dependencies
```

**注意事项**：
**Gotchas**:
- 在大型项目上可能需要时间
- Can take time on large projects
- 在项目开始时比开发期间更有用
- More useful at project start than during development
- 有助于入门但不能替代良好的文档
- Helps with onboarding but not a replacement for good docs

## 命令技巧和模式 💡
## Command Tips & Patterns 💡

### 有效的标志组合
### Effective Flag Combinations
```bash
# 安全改进工作流程
# Safe improvement workflow
/sc:improve --preview src/component.js    # 查看将要更改的内容
/sc:improve --preview src/component.js    # See what would change
/sc:improve --safe src/component.js       # 仅应用安全更改
/sc:improve --safe src/component.js       # Apply safe changes only

# 全面分析
# Comprehensive analysis
/sc:analyze --focus security --depth deep
/sc:test --coverage
/sc:document --type api

# 智能git工作流程
# Smart git workflow
/sc:git add .
/sc:git --smart-commit --branch-strategy

# 项目理解工作流程
# Project understanding workflow
/sc:load --deep --summary
/sc:analyze --focus architecture
/sc:document --type guide
```

### 常见工作流程
### Common Workflows

**新项目入门**：
**New Project Onboarding**:
```bash
/sc:load --deep --summary
/sc:analyze --focus architecture
/sc:test --coverage
/sc:document README
```

**Bug调查**：
**Bug Investigation**:
```bash
/sc:troubleshoot "特定错误消息" --logs
/sc:troubleshoot "specific error message" --logs
/sc:analyze --focus security
/sc:test --type unit affected-component
```

**代码质量改进**：
**Code Quality Improvement**:
```bash
/sc:analyze --focus quality
/sc:improve --preview src/
/sc:cleanup --safe
/sc:test --coverage
```

**部署前检查清单**：
**Pre-deployment Checklist**:
```bash
/sc:test --type all --coverage
/sc:analyze --focus security
/sc:build --type prod --optimize
/sc:git --smart-commit
```

### 命令问题故障排除
### Troubleshooting Command Issues

**命令未按预期工作？**
**Command not working as expected?**
- 尝试添加 `--help` 查看所有选项
- Try adding `--help` to see all options
- 在可用时使用 `--preview` 或 `--safe` 标志
- Use `--preview` or `--safe` flags when available
- 从较小的范围开始（单个文件 vs. 整个项目）
- Start with smaller scope (single file vs. entire project)

**分析耗时过长？**
**Analysis taking too long?**
- 使用 `--focus` 缩小范围
- Use `--focus` to narrow scope
- 尝试 `--depth quick` 而不是深度分析
- Try `--depth quick` instead of deep analysis
- 首先分析较小的目录
- Analyze smaller directories first

**构建/测试命令失败？**
**Build/test commands failing?**
- 确保你的工具在PATH中
- Make sure your tools are in PATH
- 检查配置文件是否在预期位置
- Check that config files are in expected locations
- 首先尝试直接运行底层命令
- Try running the underlying commands directly first

**不确定使用哪个命令？**
**Not sure which command to use?**
- 使用 `/index` 浏览可用命令
- Use `/index` to browse available commands
- 查看上面的快速参考表
- Look at the Quick Reference table above
- 首先尝试最具体的命令，然后是更广泛的命令
- Try the most specific command first, then broader ones

---

## 最后说明 📝
## Final Notes 📝

**关于这些命令的真相** 💯：
**The real truth about these commands** 💯:
- **直接尝试它们** - 你不需要先学习这个指南
- **Just try them** - You don't need to study this guide first
- **从基础开始** - `/analyze`、`/build`、`/improve` 涵盖大部分需求
- **Start with the basics** - `/analyze`, `/build`, `/improve` cover most needs
- **让自动激活工作** - SuperClaude通常会选择有用的专家
- **Let auto-activation work** - SuperClaude usually picks helpful experts
- **自由实验** - 如果你想先看看会发生什么，使用 `--preview`
- **Experiment freely** - Use `--preview` if you want to see what would happen first

**仍然有些粗糙的边缘：**
**Still rough around the edges:**
- 复杂编排（spawn、task）可能有点不稳定
- Complex orchestration (spawn, task) can be a bit flaky
- 一些分析很大程度上取决于你的项目设置
- Some analysis depends heavily on your project setup
- 某些命令的错误处理可能更好
- Error handling could be better in some commands

**一直在变得更好：**
**Getting better all the time:**
- 我们根据用户反馈积极改进命令
- We actively improve commands based on user feedback
- 较新的命令（analyze、improve）往往工作得更好
- Newer commands (analyze, improve) tend to work better
- 自动激活变得越来越智能
- Auto-activation keeps getting smarter

**不要为记住这个而感到压力** 🧘‍♂️
**Don't stress about memorizing this** 🧘‍♂️
- SuperClaude被设计为通过使用来发现
- SuperClaude is designed to be discoverable through use
- 输入 `/` 查看可用命令
- Type `/` to see available commands
- 当你使用 `--help` 时，命令会建议它们能做什么
- Commands suggest what they can do when you use `--help`
- 智能路由处理大部分复杂性
- The intelligent routing handles most of the complexity

**需要帮助？** 检查GitHub问题或如果你遇到困难就创建一个新的！🚀
**Need help?** Check the GitHub issues or create a new one if you're stuck! 🚀

---

*编码愉快！只要记住 - 你可以跳过这个指南的大部分内容，通过实践来学习。🎯*
*Happy coding! Just remember - you can skip most of this guide and learn by doing. 🎯*
#!/bin/bash

# AI驱动开发工作流脚本
# 用于自动化AI开发过程中的常见任务

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置文件路径
CONFIG_FILE=".ai/config/ai-development-config.yml"
PROMPT_DIR=".ai/prompts"
CONTEXT_DIR=".ai/context"
OUTPUT_DIR=".ai/output"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖项..."
    
    # 检查必要的工具
    local tools=("node" "npm" "git" "docker" "curl" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "缺少必要工具: $tool"
            exit 1
        fi
    done
    
    # 检查AI配置文件
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "AI配置文件不存在: $CONFIG_FILE"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 初始化AI开发环境
init_ai_environment() {
    log_info "初始化AI开发环境..."
    
    # 创建必要的目录
    mkdir -p "$PROMPT_DIR" "$CONTEXT_DIR" "$OUTPUT_DIR"
    mkdir -p ".ai/logs" ".ai/cache" ".ai/templates"
    
    # 创建上下文文件
    if [ ! -f "$CONTEXT_DIR/project-context.md" ]; then
        cat > "$CONTEXT_DIR/project-context.md" << EOF
# 项目上下文信息

## 项目概述
健身房多品牌管理SaaS系统

## 当前开发状态
- 项目初始化阶段
- 技术栈选型完成
- 架构设计进行中

## 最近更新
$(date): AI开发环境初始化
EOF
    fi
    
    log_success "AI开发环境初始化完成"
}

# 任务分解功能
break_down_task() {
    local task_description="$1"
    
    if [ -z "$task_description" ]; then
        log_error "请提供任务描述"
        echo "用法: $0 breakdown \"任务描述\""
        exit 1
    fi
    
    log_info "分解任务: $task_description"
    
    # 生成任务分解提示词
    local prompt_file="$OUTPUT_DIR/task-breakdown-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$prompt_file" << EOF
# 任务分解请求

## 角色定义
你是一个资深的项目管理专家和技术架构师，专精于复杂任务的分解和规划。

## 项目背景
健身房多品牌管理SaaS系统开发项目。

## 技术栈
- 后端: NestJS + TypeScript + PostgreSQL + Redis
- 前端: Vue 3 + TypeScript + Element Plus
- 小程序: 微信小程序原生开发

## 任务描述
$task_description

## 分解要求
请将上述任务分解为具体的开发子任务，包括：

1. **需求分析**
   - 功能需求拆解
   - 非功能需求识别
   - 验收标准定义

2. **技术设计**
   - 数据模型设计
   - API接口设计
   - 前端组件设计

3. **开发任务**
   - 后端开发任务
   - 前端开发任务
   - 测试开发任务

4. **质量保证**
   - 代码审查要点
   - 测试策略
   - 性能优化

## 输出格式
请按照以下格式输出：

### 任务概述
[任务的整体描述和目标]

### 子任务列表
1. **[子任务名称]**
   - 描述: [详细描述]
   - 预估工时: [小时]
   - 依赖: [前置任务]
   - 交付物: [具体的交付物]
   - 验收标准: [如何验证完成]

### 技术方案
[关键的技术实现方案]

### 风险评估
[潜在的风险和应对措施]

### 时间规划
[建议的开发时间线]
EOF
    
    log_success "任务分解提示词已生成: $prompt_file"
    log_info "请将此提示词发送给AI模型进行任务分解"
}

# 代码生成功能
generate_code() {
    local module_name="$1"
    local code_type="$2"
    
    if [ -z "$module_name" ] || [ -z "$code_type" ]; then
        log_error "请提供模块名称和代码类型"
        echo "用法: $0 generate <module_name> <code_type>"
        echo "代码类型: entity|service|controller|component|api|test"
        exit 1
    fi
    
    log_info "生成 $module_name 模块的 $code_type 代码"
    
    # 选择合适的模板
    local template_file="$PROMPT_DIR/templates.md"
    if [ ! -f "$template_file" ]; then
        log_error "模板文件不存在: $template_file"
        exit 1
    fi
    
    # 生成代码生成提示词
    local prompt_file="$OUTPUT_DIR/code-generation-${module_name}-${code_type}-$(date +%Y%m%d-%H%M%S).md"
    
    # 根据代码类型选择模板
    case "$code_type" in
        "entity")
            log_info "使用实体类生成模板"
            ;;
        "service")
            log_info "使用Service层生成模板"
            ;;
        "controller")
            log_info "使用Controller层生成模板"
            ;;
        "component")
            log_info "使用Vue组件生成模板"
            ;;
        "api")
            log_info "使用API客户端生成模板"
            ;;
        "test")
            log_info "使用测试生成模板"
            ;;
        *)
            log_error "不支持的代码类型: $code_type"
            exit 1
            ;;
    esac
    
    # 创建个性化的代码生成提示词
    cat > "$prompt_file" << EOF
# $module_name 模块 - $code_type 代码生成

## 项目上下文
$(cat "$CONTEXT_DIR/project-context.md" 2>/dev/null || echo "请更新项目上下文信息")

## 模块信息
- 模块名称: $module_name
- 代码类型: $code_type
- 生成时间: $(date)

## 技术要求
请参考 AI 配置文件中的技术栈和编码规范。

## 具体任务
请为 $module_name 模块生成 $code_type 相关的代码，确保：
1. 遵循项目的编码规范
2. 实现完整的功能逻辑
3. 添加详细的注释
4. 生成相应的测试用例
5. 考虑错误处理和边界条件

## 输出要求
1. 完整的代码实现
2. 相关的类型定义
3. 测试用例
4. 使用文档
5. 集成说明
EOF
    
    log_success "代码生成提示词已创建: $prompt_file"
}

# 代码审查功能
review_code() {
    local file_path="$1"
    
    if [ -z "$file_path" ]; then
        log_error "请提供要审查的文件路径"
        echo "用法: $0 review <file_path>"
        exit 1
    fi
    
    if [ ! -f "$file_path" ]; then
        log_error "文件不存在: $file_path"
        exit 1
    fi
    
    log_info "生成代码审查提示词: $file_path"
    
    local prompt_file="$OUTPUT_DIR/code-review-$(basename "$file_path")-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$prompt_file" << EOF
# 代码审查请求

## 角色定义
你是一个经验丰富的技术架构师和代码审查专家。

## 项目背景
健身房多品牌管理SaaS系统

## 审查文件
文件路径: $file_path

## 代码内容
\`\`\`$(file "$file_path" | cut -d: -f2 | xargs)
$(cat "$file_path")
\`\`\`

## 审查要求
请从以下维度对代码进行全面审查：

### 1. 功能性
- 代码是否正确实现了预期功能
- 业务逻辑是否合理
- 边界条件是否正确处理

### 2. 代码质量
- 代码结构是否清晰
- 命名是否规范
- 注释是否充分
- 是否遵循SOLID原则

### 3. 安全性
- 是否存在安全漏洞
- 用户输入是否正确验证
- 权限控制是否到位
- 敏感信息是否安全处理

### 4. 性能
- 是否存在性能瓶颈
- 数据库查询是否优化
- 缓存策略是否合理
- 资源使用是否高效

### 5. 可维护性
- 代码是否易于理解和修改
- 模块划分是否合理
- 依赖关系是否清晰
- 测试覆盖是否充分

## 输出格式
请按照以下格式提供审查结果：

### 总体评价
[优秀/良好/需改进]

### 主要优点
1. [优点1]
2. [优点2]
...

### 需要改进的问题
1. **[问题类别]**: [具体问题描述]
   - 影响: [问题的影响]
   - 建议: [改进建议]
   - 优先级: [高/中/低]

### 安全风险评估
[安全风险等级和具体风险点]

### 性能优化建议
[具体的性能优化建议]

### 重构建议
[如果需要重构，提供具体的重构方案]
EOF
    
    log_success "代码审查提示词已生成: $prompt_file"
}

# 测试生成功能
generate_tests() {
    local file_path="$1"
    local test_type="$2"
    
    if [ -z "$file_path" ]; then
        log_error "请提供要测试的文件路径"
        echo "用法: $0 test <file_path> [test_type]"
        echo "测试类型: unit|integration|e2e (默认: unit)"
        exit 1
    fi
    
    if [ ! -f "$file_path" ]; then
        log_error "文件不存在: $file_path"
        exit 1
    fi
    
    test_type=${test_type:-"unit"}
    
    log_info "生成 $test_type 测试: $file_path"
    
    local prompt_file="$OUTPUT_DIR/test-generation-$(basename "$file_path")-${test_type}-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$prompt_file" << EOF
# 测试用例生成请求

## 角色定义
你是一个专业的测试工程师，专精于自动化测试和质量保证。

## 项目背景
健身房多品牌管理SaaS系统

## 测试目标
文件路径: $file_path
测试类型: $test_type

## 源代码
\`\`\`$(file "$file_path" | cut -d: -f2 | xargs)
$(cat "$file_path")
\`\`\`

## 测试要求
请为上述代码生成完整的 $test_type 测试，包括：

### 测试覆盖范围
1. **正常流程测试**
   - 验证主要功能的正确性
   - 测试预期的输入输出

2. **边界条件测试**
   - 测试边界值
   - 验证极限情况

3. **异常情况测试**
   - 测试错误处理
   - 验证异常抛出

4. **性能测试**（如适用）
   - 测试响应时间
   - 验证资源使用

### 测试技术栈
- 测试框架: Jest
- 断言库: Jest内置
- Mock库: Jest Mock
- 测试工具: Supertest (API测试)

### 测试数据
请提供：
1. 测试数据工厂
2. Mock对象配置
3. 测试环境设置

## 输出要求
1. 完整的测试文件
2. 测试数据准备
3. Mock配置
4. 测试运行说明
5. 覆盖率目标

## 代码规范
- 使用describe和it组织测试
- 遵循AAA模式（Arrange, Act, Assert）
- 添加清晰的测试描述
- 实现测试隔离
EOF
    
    log_success "测试生成提示词已创建: $prompt_file"
}

# 文档生成功能
generate_docs() {
    local doc_type="$1"
    local target="$2"
    
    if [ -z "$doc_type" ]; then
        log_error "请提供文档类型"
        echo "用法: $0 docs <doc_type> [target]"
        echo "文档类型: api|readme|changelog|deployment"
        exit 1
    fi
    
    log_info "生成 $doc_type 文档"
    
    local prompt_file="$OUTPUT_DIR/docs-generation-${doc_type}-$(date +%Y%m%d-%H%M%S).md"
    
    case "$doc_type" in
        "api")
            cat > "$prompt_file" << EOF
# API文档生成请求

## 角色定义
你是一个专业的技术文档工程师，专精于API文档的编写。

## 项目背景
健身房多品牌管理SaaS系统的API文档

## 文档要求
请生成完整的API文档，包括：

1. **API概述**
   - 系统介绍
   - 认证方式
   - 基础URL
   - 版本信息

2. **接口列表**
   - 按模块分组
   - 详细的接口说明
   - 请求参数
   - 响应格式
   - 错误码

3. **示例代码**
   - 请求示例
   - 响应示例
   - SDK使用示例

4. **最佳实践**
   - 使用建议
   - 性能优化
   - 错误处理

## 输出格式
Markdown格式，适合在线文档平台展示
EOF
            ;;
        "readme")
            cat > "$prompt_file" << EOF
# README文档生成请求

## 角色定义
你是一个专业的项目文档编写专家。

## 项目信息
项目名称: 健身房多品牌管理SaaS系统
目标: $target

## 文档要求
请生成专业的README.md文档，包括：

1. **项目介绍**
   - 项目概述
   - 主要功能
   - 技术特点

2. **快速开始**
   - 环境要求
   - 安装步骤
   - 运行指南

3. **项目结构**
   - 目录说明
   - 核心模块
   - 配置文件

4. **开发指南**
   - 开发环境搭建
   - 编码规范
   - 提交规范

5. **部署说明**
   - 部署要求
   - 部署步骤
   - 环境配置

6. **贡献指南**
   - 如何贡献
   - 问题反馈
   - 联系方式
EOF
            ;;
        *)
            log_error "不支持的文档类型: $doc_type"
            exit 1
            ;;
    esac
    
    log_success "文档生成提示词已创建: $prompt_file"
}

# 质量检查功能
quality_check() {
    log_info "执行代码质量检查..."
    
    # 检查代码风格
    if command -v eslint &> /dev/null; then
        log_info "运行ESLint检查..."
        eslint . --ext .ts,.js,.vue || log_warning "ESLint检查发现问题"
    fi
    
    # 检查类型
    if command -v tsc &> /dev/null; then
        log_info "运行TypeScript类型检查..."
        tsc --noEmit || log_warning "TypeScript类型检查发现问题"
    fi
    
    # 运行测试
    if [ -f "package.json" ] && grep -q '"test"' package.json; then
        log_info "运行测试套件..."
        npm test || log_warning "测试执行发现问题"
    fi
    
    # 检查安全漏洞
    if command -v npm &> /dev/null; then
        log_info "检查安全漏洞..."
        npm audit || log_warning "发现安全漏洞"
    fi
    
    log_success "质量检查完成"
}

# 生成开发报告
generate_report() {
    log_info "生成开发报告..."
    
    local report_file="$OUTPUT_DIR/development-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# 开发报告

生成时间: $(date)

## 项目状态
- 项目名称: 健身房多品牌管理SaaS系统
- 当前版本: $(git describe --tags --always 2>/dev/null || echo "未知")
- 最后提交: $(git log -1 --format="%h - %s (%an, %ar)" 2>/dev/null || echo "无Git信息")

## 代码统计
\`\`\`
$(find . -name "*.ts" -o -name "*.js" -o -name "*.vue" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 || echo "无法统计代码行数")
\`\`\`

## 文件结构
\`\`\`
$(tree -I 'node_modules|.git|dist|build' -L 3 2>/dev/null || find . -type d -name "node_modules" -prune -o -type d -print | head -20)
\`\`\`

## 最近的AI生成文件
$(ls -la "$OUTPUT_DIR"/*.md 2>/dev/null | tail -5 || echo "暂无AI生成文件")

## 待办事项
- [ ] 完善单元测试
- [ ] 优化性能
- [ ] 更新文档
- [ ] 安全审计

## 下一步计划
1. 继续完善核心功能
2. 提高测试覆盖率
3. 优化用户体验
4. 准备生产部署
EOF
    
    log_success "开发报告已生成: $report_file"
}

# 清理功能
cleanup() {
    log_info "清理AI生成的临时文件..."
    
    # 清理超过7天的输出文件
    find "$OUTPUT_DIR" -name "*.md" -mtime +7 -delete 2>/dev/null || true
    
    # 清理缓存
    rm -rf ".ai/cache/*" 2>/dev/null || true
    
    log_success "清理完成"
}

# 帮助信息
show_help() {
    cat << EOF
AI驱动开发工作流脚本

用法: $0 <command> [options]

命令:
  init                    初始化AI开发环境
  breakdown <task>        分解开发任务
  generate <module> <type> 生成代码
  review <file>           代码审查
  test <file> [type]      生成测试用例
  docs <type> [target]    生成文档
  quality                 质量检查
  report                  生成开发报告
  cleanup                 清理临时文件
  help                    显示帮助信息

示例:
  $0 init
  $0 breakdown "实现用户管理模块"
  $0 generate user entity
  $0 review src/user/user.service.ts
  $0 test src/user/user.service.ts unit
  $0 docs api
  $0 quality
  $0 report

更多信息请参考: .ai/README.md
EOF
}

# 主函数
main() {
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] && [ ! -f "pom.xml" ] && [ ! -f "go.mod" ]; then
        log_warning "当前目录可能不是项目根目录"
    fi
    
    # 解析命令
    case "${1:-help}" in
        "init")
            check_dependencies
            init_ai_environment
            ;;
        "breakdown")
            break_down_task "$2"
            ;;
        "generate")
            generate_code "$2" "$3"
            ;;
        "review")
            review_code "$2"
            ;;
        "test")
            generate_tests "$2" "$3"
            ;;
        "docs")
            generate_docs "$2" "$3"
            ;;
        "quality")
            quality_check
            ;;
        "report")
            generate_report
            ;;
        "cleanup")
            cleanup
            ;;
        "help")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
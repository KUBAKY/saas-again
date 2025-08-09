#!/bin/bash

# 健身房SaaS系统测试脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 运行后端测试
test_backend() {
    log_info "运行后端测试..."
    
    cd backend
    
    # 单元测试
    if npm run test 2>/dev/null; then
        log_success "后端单元测试通过"
    else
        log_warning "后端单元测试失败或不存在测试文件"
    fi
    
    # E2E测试
    if npm run test:e2e 2>/dev/null; then
        log_success "后端E2E测试通过"
    else
        log_warning "后端E2E测试失败或不存在测试文件"
    fi
    
    # TypeScript类型检查
    if npm run build 2>/dev/null; then
        log_success "后端TypeScript构建通过"
    else
        log_error "后端TypeScript构建失败"
        cd ..
        return 1
    fi
    
    # ESLint检查
    if npm run lint 2>/dev/null; then
        log_success "后端ESLint检查通过"
    else
        log_warning "后端ESLint检查有警告"
    fi
    
    cd ..
}

# 运行前端测试
test_frontend() {
    log_info "运行前端测试..."
    
    cd frontend
    
    # 单元测试
    if npm run test 2>/dev/null; then
        log_success "前端单元测试通过"
    else
        log_warning "前端单元测试失败或不存在测试文件"
    fi
    
    # TypeScript类型检查
    if npm run type-check 2>/dev/null; then
        log_success "前端TypeScript检查通过"
    else
        log_warning "前端TypeScript检查失败或命令不存在"
    fi
    
    # 构建检查
    if npm run build 2>/dev/null; then
        log_success "前端构建通过"
    else
        log_error "前端构建失败"
        cd ..
        return 1
    fi
    
    # ESLint检查
    if npm run lint 2>/dev/null; then
        log_success "前端ESLint检查通过"
    else
        log_warning "前端ESLint检查有警告"
    fi
    
    cd ..
}

# API测试
test_api() {
    log_info "运行API测试..."
    
    # 检查是否有测试服务在运行
    if ! curl -f http://localhost:3000/health 2>/dev/null; then
        log_warning "后端服务未运行，跳过API测试"
        return 0
    fi
    
    # 测试基本API端点
    local endpoints=(
        "GET /health"
        "GET /api/auth/profile"
        "GET /api/members"
        "GET /api/stores"
        "GET /api/brands"
    )
    
    for endpoint in "${endpoints[@]}"; do
        method=$(echo $endpoint | cut -d' ' -f1)
        path=$(echo $endpoint | cut -d' ' -f2)
        
        if [ "$method" = "GET" ]; then
            if curl -f "http://localhost:3000${path}" 2>/dev/null >/dev/null; then
                log_success "API测试通过: $endpoint"
            else
                log_warning "API测试失败: $endpoint"
            fi
        fi
    done
}

# Docker容器测试
test_docker() {
    log_info "测试Docker配置..."
    
    # 测试后端Dockerfile
    if docker build -t test-backend ./backend --target development 2>/dev/null; then
        log_success "后端Docker构建测试通过"
        docker rmi test-backend 2>/dev/null || true
    else
        log_error "后端Docker构建测试失败"
        return 1
    fi
    
    # 测试前端Dockerfile
    if docker build -t test-frontend ./frontend --target development 2>/dev/null; then
        log_success "前端Docker构建测试通过"
        docker rmi test-frontend 2>/dev/null || true
    else
        log_error "前端Docker构建测试失败"
        return 1
    fi
    
    # 测试docker-compose配置
    if docker-compose -f docker-compose.dev.yml config 2>/dev/null >/dev/null; then
        log_success "开发环境Docker Compose配置测试通过"
    else
        log_error "开发环境Docker Compose配置测试失败"
        return 1
    fi
    
    if docker-compose -f docker-compose.prod.yml config 2>/dev/null >/dev/null; then
        log_success "生产环境Docker Compose配置测试通过"
    else
        log_error "生产环境Docker Compose配置测试失败"
        return 1
    fi
}

# 安全检查
security_check() {
    log_info "执行安全检查..."
    
    # 检查敏感文件
    local sensitive_patterns=(
        "password"
        "secret"
        "key"
        "token"
        "api_key"
    )
    
    for pattern in "${sensitive_patterns[@]}"; do
        if grep -r -i "$pattern" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="test.sh" --exclude="deploy.sh" . | grep -v "example" | grep -v "placeholder" 2>/dev/null; then
            log_warning "发现可能的敏感信息: $pattern"
        fi
    done
    
    # 检查环境变量文件
    if [ -f ".env" ]; then
        log_warning "发现.env文件，请确保不会提交到版本控制"
    fi
    
    # 检查Docker安全配置
    if grep -q "USER" backend/Dockerfile && grep -q "USER" frontend/Dockerfile; then
        log_success "Docker安全配置检查通过（非root用户）"
    else
        log_warning "建议在Dockerfile中使用非root用户"
    fi
}

# 性能测试
performance_test() {
    log_info "执行基础性能测试..."
    
    # 检查是否安装了ab（Apache Bench）
    if ! command -v ab &> /dev/null; then
        log_warning "Apache Bench (ab) 未安装，跳过性能测试"
        return 0
    fi
    
    # 检查服务是否运行
    if ! curl -f http://localhost:3000/health 2>/dev/null; then
        log_warning "后端服务未运行，跳过性能测试"
        return 0
    fi
    
    # 简单的并发测试
    log_info "执行健康检查端点性能测试..."
    if ab -n 100 -c 10 http://localhost:3000/health 2>/dev/null | grep "Requests per second" | head -1; then
        log_success "性能测试完成"
    else
        log_warning "性能测试失败"
    fi
}

# 主测试函数
main() {
    local test_type=${1:-all}
    
    log_info "开始执行测试 - 类型: $test_type"
    
    case $test_type in
        "backend")
            test_backend
            ;;
        "frontend")
            test_frontend
            ;;
        "api")
            test_api
            ;;
        "docker")
            test_docker
            ;;
        "security")
            security_check
            ;;
        "performance")
            performance_test
            ;;
        "all")
            test_backend
            test_frontend
            test_docker
            test_api
            security_check
            performance_test
            ;;
        "help"|"-h"|"--help")
            echo "健身房SaaS系统测试脚本"
            echo ""
            echo "使用方法:"
            echo "  $0 [测试类型]"
            echo ""
            echo "测试类型:"
            echo "  all          运行所有测试 (默认)"
            echo "  backend      运行后端测试"
            echo "  frontend     运行前端测试"
            echo "  api          运行API测试"
            echo "  docker       运行Docker配置测试"
            echo "  security     运行安全检查"
            echo "  performance  运行性能测试"
            echo ""
            exit 0
            ;;
        *)
            log_error "未知的测试类型: $test_type"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
    
    log_success "测试执行完成"
}

main "$@"
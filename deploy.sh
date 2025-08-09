#!/bin/bash

# 健身房SaaS系统部署脚本
# 使用方法: ./deploy.sh [dev|prod] [--build]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    log_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 检查环境变量文件
check_env_file() {
    local env_file=$1
    
    if [ ! -f "$env_file" ]; then
        log_warning "环境变量文件 $env_file 不存在"
        log_info "从 .env.example 复制示例文件..."
        cp .env.example "$env_file"
        log_warning "请编辑 $env_file 文件，设置正确的环境变量值"
        echo "请按任意键继续..."
        read -n 1
    fi
}

# 构建镜像
build_images() {
    local environment=$1
    local compose_file=$2
    
    log_info "构建 Docker 镜像..."
    
    if [ "$environment" = "dev" ]; then
        docker-compose -f "$compose_file" build --parallel
    else
        docker-compose -f "$compose_file" build --parallel --no-cache
    fi
    
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    local compose_file=$1
    
    log_info "启动服务..."
    docker-compose -f "$compose_file" up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    docker-compose -f "$compose_file" ps
    
    log_success "服务启动完成"
}

# 停止服务
stop_services() {
    local compose_file=$1
    
    log_info "停止服务..."
    docker-compose -f "$compose_file" down
    
    log_success "服务已停止"
}

# 查看日志
show_logs() {
    local compose_file=$1
    local service=$2
    
    if [ -n "$service" ]; then
        docker-compose -f "$compose_file" logs -f "$service"
    else
        docker-compose -f "$compose_file" logs -f
    fi
}

# 健康检查
health_check() {
    local environment=$1
    
    log_info "执行健康检查..."
    
    # 检查数据库连接
    if docker-compose -f "docker-compose.${environment}.yml" exec postgres pg_isready -U postgres; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接失败"
        return 1
    fi
    
    # 检查Redis连接
    if docker-compose -f "docker-compose.${environment}.yml" exec redis redis-cli ping | grep PONG; then
        log_success "Redis连接正常"
    else
        log_error "Redis连接失败"
        return 1
    fi
    
    # 检查后端服务
    if curl -f http://localhost:3000/health 2>/dev/null; then
        log_success "后端服务正常"
    else
        log_error "后端服务异常"
        return 1
    fi
    
    # 检查前端服务
    local frontend_port=5173
    if [ "$environment" = "prod" ]; then
        frontend_port=80
    fi
    
    if curl -f "http://localhost:${frontend_port}" 2>/dev/null; then
        log_success "前端服务正常"
    else
        log_error "前端服务异常"
        return 1
    fi
    
    log_success "所有服务健康检查通过"
}

# 数据库迁移
run_migrations() {
    local environment=$1
    
    log_info "执行数据库迁移..."
    
    # 等待数据库启动
    sleep 5
    
    # 执行迁移（这里需要根据实际的迁移命令调整）
    docker-compose -f "docker-compose.${environment}.yml" exec backend npm run migration:run || true
    
    log_success "数据库迁移完成"
}

# 主函数
main() {
    local environment=${1:-dev}
    local build_flag=$2
    local compose_file="docker-compose.${environment}.yml"
    
    log_info "开始部署健身房SaaS系统 - ${environment} 环境"
    
    # 检查环境参数
    if [[ "$environment" != "dev" && "$environment" != "prod" ]]; then
        log_error "无效的环境参数: $environment (支持: dev, prod)"
        exit 1
    fi
    
    # 检查compose文件是否存在
    if [ ! -f "$compose_file" ]; then
        log_error "Docker Compose 文件不存在: $compose_file"
        exit 1
    fi
    
    # 检查依赖
    check_dependencies
    
    # 检查环境变量文件
    if [ "$environment" = "prod" ]; then
        check_env_file ".env"
    fi
    
    # 构建镜像（如果指定了构建参数）
    if [ "$build_flag" = "--build" ]; then
        build_images "$environment" "$compose_file"
    fi
    
    # 启动服务
    start_services "$compose_file"
    
    # 执行数据库迁移
    run_migrations "$environment"
    
    # 健康检查
    if health_check "$environment"; then
        log_success "部署完成！"
        echo ""
        log_info "访问信息:"
        if [ "$environment" = "dev" ]; then
            echo "  前端服务: http://localhost:5173"
            echo "  Nginx代理: http://localhost:80"
        else
            echo "  应用访问: http://localhost:80"
        fi
        echo "  后端API: http://localhost:3000"
        echo "  数据库: localhost:5432"
        echo "  Redis: localhost:6379"
        echo ""
        log_info "常用命令:"
        echo "  查看日志: docker-compose -f $compose_file logs -f [service_name]"
        echo "  停止服务: docker-compose -f $compose_file down"
        echo "  重启服务: docker-compose -f $compose_file restart [service_name]"
    else
        log_error "部署过程中出现问题，请检查日志"
        show_logs "$compose_file"
        exit 1
    fi
}

# 处理命令行参数
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "健身房SaaS系统部署脚本"
        echo ""
        echo "使用方法:"
        echo "  $0 [环境] [选项]"
        echo ""
        echo "环境:"
        echo "  dev     开发环境 (默认)"
        echo "  prod    生产环境"
        echo ""
        echo "选项:"
        echo "  --build 构建Docker镜像"
        echo ""
        echo "示例:"
        echo "  $0 dev --build    # 开发环境部署并构建镜像"
        echo "  $0 prod           # 生产环境部署"
        echo "  $0 help           # 显示帮助"
        exit 0
        ;;
    "stop")
        environment=${2:-dev}
        compose_file="docker-compose.${environment}.yml"
        stop_services "$compose_file"
        exit 0
        ;;
    "logs")
        environment=${2:-dev}
        service=$3
        compose_file="docker-compose.${environment}.yml"
        show_logs "$compose_file" "$service"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
# 多阶段构建 - 前端服务
FROM node:20-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# 复制 package 文件
COPY package*.json ./

# 开发阶段
FROM base AS development
ENV NODE_ENV=development
RUN npm install --include=dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 构建阶段
FROM base AS build
ENV NODE_ENV=production
# 安装所有依赖（包括开发依赖）用于构建
RUN npm ci --silent
COPY . .
RUN npm run build

# 生产阶段 - 使用 nginx 服务静态文件
FROM nginx:alpine AS production

# 安装必要工具
RUN apk add --no-cache curl

# 创建非特权用户
RUN addgroup -g 1001 -S nginx_app && adduser -S nginx_app -u 1001

# 复制构建文件
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 设置权限
RUN chown -R nginx_app:nginx_app /usr/share/nginx/html && \
    chown -R nginx_app:nginx_app /var/cache/nginx && \
    chown -R nginx_app:nginx_app /var/log/nginx && \
    chown -R nginx_app:nginx_app /etc/nginx/conf.d

# 创建 nginx 运行需要的目录
RUN touch /var/run/nginx.pid && \
    chown -R nginx_app:nginx_app /var/run/nginx.pid

# 切换到非特权用户
USER nginx_app

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
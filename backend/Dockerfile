# 多阶段构建 - 后端服务
FROM node:20-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++

WORKDIR /usr/src/app

# 复制 package 文件
COPY package*.json ./

# 开发阶段
FROM base AS development
ENV NODE_ENV=development
RUN npm install --include=dev
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "start:dev"]

# 构建阶段
FROM base AS build
ENV NODE_ENV=production
RUN npm ci --only=production --silent
COPY . .
RUN npm run build
RUN npm prune --production

# 生产阶段
FROM node:20-alpine AS production

# 创建非特权用户
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /usr/src/app

# 从构建阶段复制文件
COPY --from=build --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /usr/src/app/package*.json ./

# 切换到非特权用户
USER nestjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1

EXPOSE 3000

CMD ["node", "dist/main.js"]
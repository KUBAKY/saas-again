# 健身房多品牌管理SaaS系统 API接口规范

## 1. 接口设计原则

### 1.1 RESTful设计规范
- 使用标准HTTP方法：GET、POST、PUT、DELETE、PATCH
- 统一资源定位：`/api/v1/{resource}`
- 状态码规范：200、201、400、401、403、404、422、500

### 1.2 响应格式标准
```typescript
// 成功响应
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": any,
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// 错误响应
{
  "success": false,
  "code": 400,
  "message": "错误描述",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 1.3 认证规范
- Bearer Token: `Authorization: Bearer <jwt_token>`
- 多租户隔离：通过JWT中的brandId和storeId实现

## 2. 核心API模块

### 2.1 认证模块 (Auth)
```
POST /api/v1/auth/login          # 用户登录
POST /api/v1/auth/register       # 用户注册
POST /api/v1/auth/refresh        # 刷新令牌
POST /api/v1/auth/logout         # 用户登出
GET  /api/v1/auth/profile        # 获取用户信息
PUT  /api/v1/auth/profile        # 更新用户信息
POST /api/v1/auth/change-password # 修改密码
```

### 2.2 品牌管理 (Brands)
```
GET    /api/v1/brands            # 获取品牌列表
POST   /api/v1/brands            # 创建品牌
GET    /api/v1/brands/:id        # 获取品牌详情
PUT    /api/v1/brands/:id        # 更新品牌
DELETE /api/v1/brands/:id        # 删除品牌
GET    /api/v1/brands/:id/stats  # 获取品牌统计信息
```

### 2.3 门店管理 (Stores)
```
GET    /api/v1/stores            # 获取门店列表
POST   /api/v1/stores            # 创建门店
GET    /api/v1/stores/:id        # 获取门店详情
PUT    /api/v1/stores/:id        # 更新门店
DELETE /api/v1/stores/:id        # 删除门店
GET    /api/v1/stores/:id/stats  # 获取门店统计信息
```

### 2.4 用户管理 (Users)
```
GET    /api/v1/users             # 获取用户列表
POST   /api/v1/users             # 创建用户
GET    /api/v1/users/:id         # 获取用户详情
PUT    /api/v1/users/:id         # 更新用户
DELETE /api/v1/users/:id         # 删除用户
PUT    /api/v1/users/:id/status  # 更新用户状态
PUT    /api/v1/users/:id/roles   # 更新用户角色
```

### 2.5 会员管理 (Members)
```
GET    /api/v1/members           # 获取会员列表
POST   /api/v1/members           # 创建会员
GET    /api/v1/members/:id       # 获取会员详情
PUT    /api/v1/members/:id       # 更新会员
DELETE /api/v1/members/:id       # 删除会员
GET    /api/v1/members/:id/cards # 获取会员卡列表
POST   /api/v1/members/:id/cards # 为会员创建会员卡
GET    /api/v1/members/:id/checkins # 获取会员签到记录
GET    /api/v1/members/:id/bookings # 获取会员预约记录
```

### 2.6 教练管理 (Coaches)
```
GET    /api/v1/coaches           # 获取教练列表
POST   /api/v1/coaches           # 创建教练
GET    /api/v1/coaches/:id       # 获取教练详情
PUT    /api/v1/coaches/:id       # 更新教练
DELETE /api/v1/coaches/:id       # 删除教练
GET    /api/v1/coaches/:id/schedule # 获取教练排课
GET    /api/v1/coaches/:id/bookings # 获取教练预约记录
```

### 2.7 课程管理 (Courses)
```
GET    /api/v1/courses           # 获取课程列表
POST   /api/v1/courses           # 创建课程
GET    /api/v1/courses/:id       # 获取课程详情
PUT    /api/v1/courses/:id       # 更新课程
DELETE /api/v1/courses/:id       # 删除课程
GET    /api/v1/courses/:id/bookings # 获取课程预约记录
```

### 2.8 预约管理 (Bookings)
```
GET    /api/v1/bookings          # 获取预约列表
POST   /api/v1/bookings          # 创建预约
GET    /api/v1/bookings/:id      # 获取预约详情
PUT    /api/v1/bookings/:id      # 更新预约
DELETE /api/v1/bookings/:id      # 取消预约
PUT    /api/v1/bookings/:id/status # 更新预约状态
```

### 2.9 签到管理 (CheckIns)
```
GET    /api/v1/checkins          # 获取签到记录
POST   /api/v1/checkins          # 创建签到记录
GET    /api/v1/checkins/:id      # 获取签到详情
PUT    /api/v1/checkins/:id      # 更新签到记录
```

### 2.10 会员卡管理 (MembershipCards)
```
GET    /api/v1/membership-cards  # 获取会员卡列表
POST   /api/v1/membership-cards  # 创建会员卡
GET    /api/v1/membership-cards/:id # 获取会员卡详情
PUT    /api/v1/membership-cards/:id # 更新会员卡
DELETE /api/v1/membership-cards/:id # 删除会员卡
PUT    /api/v1/membership-cards/:id/activate # 激活会员卡
PUT    /api/v1/membership-cards/:id/suspend # 暂停会员卡
PUT    /api/v1/membership-cards/:id/renew   # 续费会员卡
```

### 2.11 角色权限管理 (Roles & Permissions)
```
GET    /api/v1/roles             # 获取角色列表
POST   /api/v1/roles             # 创建角色
GET    /api/v1/roles/:id         # 获取角色详情
PUT    /api/v1/roles/:id         # 更新角色
DELETE /api/v1/roles/:id         # 删除角色
GET    /api/v1/permissions       # 获取权限列表
PUT    /api/v1/roles/:id/permissions # 更新角色权限
```

## 3. 查询参数规范

### 3.1 分页参数
```
page: number = 1        # 页码
limit: number = 20      # 每页数量
```

### 3.2 排序参数
```
sortBy: string          # 排序字段
sortOrder: 'ASC'|'DESC' # 排序方向
```

### 3.3 过滤参数
```
search: string          # 搜索关键字
status: string          # 状态过滤
startDate: string       # 开始日期
endDate: string         # 结束日期
```

## 4. 错误码规范

### 4.1 HTTP状态码
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 422: 参数验证失败
- 500: 服务器内部错误

### 4.2 业务错误码
- 1001: 用户不存在
- 1002: 密码错误
- 1003: 账户被锁定
- 2001: 品牌不存在
- 2002: 门店不存在
- 3001: 会员不存在
- 3002: 会员卡已过期
- 4001: 课程已满员
- 4002: 预约时间冲突

## 5. 数据验证规范

### 5.1 通用验证
- 邮箱格式验证
- 手机号格式验证
- 密码强度验证 (至少8位，包含字母数字)
- UUID格式验证

### 5.2 业务验证
- 品牌编码唯一性
- 门店编码在品牌内唯一性
- 会员手机号在门店内唯一性
- 预约时间有效性验证

## 6. 安全规范

### 6.1 认证安全
- JWT Token过期时间：2小时
- Refresh Token过期时间：30天
- 登录失败锁定机制：5次失败锁定30分钟

### 6.2 权限控制
- 基于角色的访问控制 (RBAC)
- 多租户数据隔离
- 接口权限细粒度控制

### 6.3 数据安全
- 敏感信息加密存储
- API请求频率限制
- SQL注入防护
- XSS防护
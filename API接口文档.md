# 电话销售管理系统 API 接口文档

## 一、系统概述

### 1.1 角色权限体系

系统采用四级角色权限体系：

- **系统管理员 (admin)**: 最高权限，可以管理所有用户（包括其他系统管理员）、团队、客户等所有系统功能
- **总经理 (manager)**: 系统内角色，拥有除管理系统管理员用户外的所有权限，可以管理总经理、组长、销售员用户
- **组长 (leader)**: 团队管理权限，可以管理本团队的客户和销售员
- **销售员 (sales)**: 个人权限，只能管理自己的客户和个人信息

### 1.2 权限矩阵

| 功能模块 | 系统管理员 | 总经理 | 组长 | 销售员 |
|---------|-----------|--------|------|--------|
| 用户管理 | ✅ 全部 | ✅ 除系统管理员外 | ❌ | ❌ |
| 团队管理 | ✅ 全部 | ✅ 全部 | ✅ 查看 | ❌ |
| 客户管理 | ✅ 全部 | ✅ 全部 | ✅ 本团队 | ✅ 个人 |
| 跟进记录 | ✅ 全部 | ✅ 全部 | ✅ 本团队 | ✅ 个人 |
| 统计报表 | ✅ 全部 | ✅ 全部 | ✅ 本团队 | ✅ 个人 |

---

## 二、接口规范

### 2.1 基础信息
- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

### 2.2 统一响应格式
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1640995200000
}
```

### 2.3 错误码定义
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 数据冲突 |
| 500 | 服务器错误 |

### 2.4 分页格式
```json
{
  "list": [],
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

---

## 二、认证相关接口

### 2.1 用户登录
**POST** `/auth/login`

**请求参数:**
```json
{
  "phone": "13800000000",
  "password": "password123"
}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800000000",
      "name": "张三",
      "role": "manager",
      "teamId": null,
      "team": null
    }
  }
}
```

### 2.2 获取当前用户信息
**GET** `/auth/profile`

**请求头:**
```
Authorization: Bearer {token}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800000000",
    "name": "张三",
    "role": "manager",
    "teamId": null,
    "team": null,
    "joinDate": "2024-01-01"
  }
}
```

### 2.3 修改密码
**PUT** `/auth/password`

**请求参数:**
```json
{
  "oldPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 四、用户管理接口

### 4.1 获取用户列表
**GET** `/users`

**权限要求:** Admin, Manager

**查询参数:**
- `page`: 页码 (默认: 1)
- `pageSize`: 每页数量 (默认: 20)
- `search`: 搜索关键词
- `role`: 角色筛选 (admin/manager/leader/sales)
- `teamId`: 小组筛选

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "phone": "13800000001",
        "name": "李四",
        "role": "sales",
        "teamId": 1,
        "team": {
          "id": 1,
          "name": "销售一组"
        },
        "joinDate": "2024-01-01",
        "status": "active"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 50
    }
  }
}
```

### 4.2 创建用户
**POST** `/users`

**权限要求:** Admin, Manager (Manager不能创建Admin用户)

**请求参数:**
```json
{
  "phone": "13800000002",
  "name": "王五",
  "role": "sales",
  "teamId": 1,
  "password": "password123",
  "joinDate": "2024-01-15"
}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "用户创建成功",
  "data": {
    "id": 2,
    "phone": "13800000002",
    "name": "王五",
    "role": "sales",
    "teamId": 1,
    "joinDate": "2024-01-15",
    "status": "active"
  }
}
```

### 4.3 更新用户信息
**PUT** `/users/{id}`

**权限要求:** Admin, Manager (Manager不能修改Admin用户)

### 4.4 重置用户密码
**PUT** `/users/{id}/password`

**权限要求:** Manager

**请求参数:**
```json
{
  "newPassword": "newpassword123"
}
```

### 4.5 删除用户
**DELETE** `/users/{id}`

**权限要求:** Manager

---

## 五、小组管理接口

### 5.1 获取小组列表
**GET** `/teams`

**权限要求:** Manager, Leader

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量
- `search`: 搜索小组名称

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "销售一组",
        "level": "10",
        "leaderId": 2,
        "leader": {
          "id": 2,
          "name": "组长张三"
        },
        "memberCount": 8,
        "maxMembers": 10,
        "members": [
          {
            "id": 3,
            "name": "销售员李四",
            "phone": "13800000003"
          }
        ]
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 5
    }
  }
}
```

### 5.2 创建小组
**POST** `/teams`

**权限要求:** Manager

**请求参数:**
```json
{
  "name": "销售二组",
  "level": "15",
  "leaderId": 3
}
```

### 5.3 更新小组信息
**PUT** `/teams/{id}`

**权限要求:** Manager

**请求参数:**
```json
{
  "name": "销售二组(更新)",
  "leaderId": 4
}
```

### 5.4 删除小组
**DELETE** `/teams/{id}`

**权限要求:** Manager

---

## 六、客户管理接口

### 6.1 获取客户列表
**GET** `/customers`

**权限要求:** All (根据角色过滤数据)

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量
- `search`: 搜索姓名或电话
- `teamId`: 小组筛选 (Manager可用)
- `ownerId`: 销售员筛选 (Manager/Leader可用)
- `starLevel`: 星级筛选
- `hasFollowToday`: 今日是否跟进 (true/false)

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "starLevel": 5,
        "name": "客户张三",
        "phone": "13900000001",
        "gender": "male",
        "age": 35,
        "qualification": "高净值客户",
        "ownerId": 3,
        "owner": {
          "id": 3,
          "name": "销售员李四"
        },
        "teamId": 1,
        "team": {
          "id": 1,
          "name": "销售一组"
        },
        "lastFollowTime": "2024-01-15T10:30:00Z",
        "todayFollowCount": 2,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 150
    }
  }
}
```

### 6.2 获取客户详情
**GET** `/customers/{id}`

**权限要求:** All (根据角色过滤数据)

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "starLevel": 5,
    "name": "客户张三",
    "phone": "13900000001",
    "gender": "male",
    "age": 35,
    "qualification": "高净值客户",
    "ownerId": 3,
    "owner": {
      "id": 3,
      "name": "销售员李四",
      "phone": "13800000003"
    },
    "teamId": 1,
    "team": {
      "id": 1,
      "name": "销售一组"
    },
    "followRecords": [
      {
        "id": 1,
        "content": "初次联系，客户有意向",
        "followTime": "2024-01-15T10:30:00Z",
        "salesId": 3,
        "sales": {
          "id": 3,
          "name": "销售员李四"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 6.3 创建客户
**POST** `/customers`

**权限要求:** All

**请求参数:**
```json
{
  "starLevel": 4,
  "name": "新客户王五",
  "phone": "13900000002",
  "gender": "female",
  "age": 28,
  "qualification": "潜在客户",
  "ownerId": 3,
  "teamId": 1
}
```

**注意:** 
- Sales角色只能创建归属于自己的客户
- Leader角色只能创建归属于本组的客户
- Manager角色可以指定任意归属

### 6.4 更新客户信息
**PUT** `/customers/{id}`

**权限要求:** All (根据角色限制可修改的客户)

**请求参数:**
```json
{
  "starLevel": 5,
  "name": "客户王五(VIP)",
  "qualification": "高价值客户"
}
```

### 6.5 转移客户
**POST** `/customers/transfer`

**权限要求:** Manager, Leader

**请求参数:**
```json
{
  "customerIds": [1, 2, 3],
  "targetOwnerId": 4,
  "targetTeamId": 2
}
```

### 6.6 删除客户
**DELETE** `/customers/{id}`

**权限要求:** Manager, Leader (组内客户), Sales (自己的客户)

---

## 七、跟进记录接口

### 7.1 获取客户跟进记录
**GET** `/customers/{customerId}/follow-records`

**权限要求:** All (根据角色过滤数据)

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "customerId": 1,
        "content": "客户表示有购买意向，需要进一步沟通产品细节",
        "followTime": "2024-01-15T14:30:00Z",
        "salesId": 3,
        "sales": {
          "id": 3,
          "name": "销售员李四"
        },
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 25
    }
  }
}
```

### 7.2 添加跟进记录
**POST** `/customers/{customerId}/follow-records`

**权限要求:** All (根据角色限制可跟进的客户)

**请求参数:**
```json
{
  "content": "今日电话回访，客户反馈良好",
  "followTime": "2024-01-15T15:00:00Z"
}
```

**注意:** 如果不提供followTime，默认使用当前时间

### 7.3 更新跟进记录
**PUT** `/follow-records/{id}`

**权限要求:** 记录创建者或Manager

**请求参数:**
```json
{
  "content": "更新后的跟进内容",
  "followTime": "2024-01-15T15:30:00Z"
}
```

### 7.4 删除跟进记录
**DELETE** `/follow-records/{id}`

**权限要求:** 记录创建者或Manager

---

## 八、统计报表接口

### 8.1 获取跟进统计
**GET** `/statistics/follow-stats`

**权限要求:** All (根据角色过滤数据)

**查询参数:**
- `startDate`: 开始日期 (默认: 今天)
- `endDate`: 结束日期 (默认: 今天)
- `teamId`: 小组筛选 (Manager可用)
- `salesId`: 销售员筛选 (Manager/Leader可用)

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "summary": {
      "totalFollowCount": 156,
      "totalCustomerCount": 89,
      "activeTeamCount": 5,
      "activeSalesCount": 23
    },
    "teamStats": [
      {
        "teamId": 1,
        "teamName": "销售一组",
        "followCount": 45,
        "customerCount": 28,
        "activeSalesCount": 8
      }
    ],
    "salesStats": [
      {
        "salesId": 3,
        "salesName": "销售员李四",
        "teamName": "销售一组",
        "followCount": 12,
        "customerCount": 8,
        "avgFollowPerCustomer": 1.5
      }
    ]
  }
}
```

### 8.2 导出统计报表
**GET** `/statistics/export`

**权限要求:** Manager

**查询参数:**
- `startDate`: 开始日期
- `endDate`: 结束日期
- `format`: 导出格式 (excel/csv)

**响应:** 文件下载

---

## 九、批量导入导出接口

### 9.1 下载导入模板
**GET** `/customers/import-template`

**权限要求:** Manager

**响应:** Excel文件下载

### 8.2 批量导入客户
**POST** `/customers/import`

**权限要求:** Manager

**请求参数:** FormData
- `file`: Excel/CSV文件
- `defaultTeamId`: 默认小组ID (可选)
- `defaultOwnerId`: 默认销售员ID (可选)

**响应数据:**
```json
{
  "code": 200,
  "message": "导入完成",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 3,
        "error": "手机号格式不正确"
      },
      {
        "row": 7,
        "error": "客户姓名不能为空"
      }
    ]
  }
}
```

### 8.3 批量导出客户
**POST** `/customers/export`

**权限要求:** Manager

**请求参数:**
```json
{
  "customerIds": [1, 2, 3],
  "includeFollowRecords": true,
  "format": "excel"
}
```

**响应:** 文件下载

---

## 九、操作日志接口

### 9.1 获取操作日志
**GET** `/logs`

**权限要求:** Manager

**查询参数:**
- `page`: 页码
- `pageSize`: 每页数量
- `userId`: 用户筛选
- `action`: 操作类型筛选
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 3,
        "user": {
          "id": 3,
          "name": "销售员李四"
        },
        "action": "CREATE_CUSTOMER",
        "targetType": "customer",
        "targetId": 1,
        "details": {
          "customerName": "客户张三",
          "customerPhone": "13900000001"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 500
    }
  }
}
```

---

## 十、错误处理示例

### 10.1 参数验证错误
```json
{
  "code": 400,
  "message": "参数验证失败",
  "data": {
    "errors": [
      {
        "field": "phone",
        "message": "手机号格式不正确"
      },
      {
        "field": "starLevel",
        "message": "星级必须在1-5之间"
      }
    ]
  }
}
```

### 10.2 权限不足错误
```json
{
  "code": 403,
  "message": "权限不足，无法访问该资源"
}
```

### 10.3 资源不存在错误
```json
{
  "code": 404,
  "message": "客户不存在或已被删除"
}
```

### 10.4 数据冲突错误
```json
{
  "code": 409,
  "message": "手机号已存在，请使用其他手机号"
}
```

---

## 十一、接口调用示例

### 11.1 JavaScript/TypeScript 示例
```typescript
// 登录
const login = async (phone: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, password }),
  });
  
  const result = await response.json();
  if (result.code === 200) {
    localStorage.setItem('token', result.data.token);
    return result.data;
  }
  throw new Error(result.message);
};

// 获取客户列表
const getCustomers = async (params: any) => {
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(params).toString();
  
  const response = await fetch(`/api/customers?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// 创建客户
const createCustomer = async (customerData: any) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });
  
  return response.json();
};
```

### 11.2 cURL 示例
```bash
# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000000","password":"password123"}'

# 获取客户列表
curl -X GET "http://localhost:3001/api/customers?page=1&pageSize=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建客户
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"starLevel":4,"name":"新客户","phone":"13900000001"}'
```

---

## 十二、接口测试

### 12.1 Postman 集合
建议创建Postman集合包含所有接口，并设置环境变量：
- `baseUrl`: http://localhost:3001/api
- `token`: {{token}} (从登录接口获取)

### 12.2 自动化测试
```typescript
// 接口测试示例
describe('Customer API', () => {
  let token: string;
  
  beforeAll(async () => {
    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ phone: '13800000000', password: 'password123' });
    
    token = loginResponse.body.data.token;
  });
  
  test('should get customers list', async () => {
    const response = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.code).toBe(200);
    expect(response.body.data.list).toBeDefined();
  });
});
```

---

这份API文档提供了完整的接口定义，开发团队可以根据此文档进行前后端开发和联调。建议在开发过程中保持文档的及时更新。 
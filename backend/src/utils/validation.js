const Joi = require('joi');

// 用户相关验证规则
const userSchemas = {
  // 登录验证
  login: Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入正确的手机号码',
      'any.required': '手机号码不能为空'
    }),
    password: Joi.string().min(6).max(20).required().messages({
      'string.min': '密码长度至少6位',
      'string.max': '密码长度不能超过20位',
      'any.required': '密码不能为空'
    })
  }),

  // 创建用户验证
  create: Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入正确的手机号码',
      'any.required': '手机号码不能为空'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': '姓名长度至少2位',
      'string.max': '姓名长度不能超过50位',
      'any.required': '姓名不能为空'
    }),
    role: Joi.string().valid('manager', 'leader', 'sales').required().messages({
      'any.only': '角色必须是manager、leader或sales',
      'any.required': '角色不能为空'
    }),
    teamId: Joi.number().integer().positive().allow(null),
    password: Joi.string().min(6).max(20).messages({
      'string.min': '密码长度至少6位',
      'string.max': '密码长度不能超过20位'
    }),
    joinDate: Joi.date().iso().required().messages({
      'any.required': '入职时间不能为空'
    })
  }),

  // 更新用户验证
  update: Joi.object({
    name: Joi.string().min(2).max(50),
    role: Joi.string().valid('manager', 'leader', 'sales'),
    teamId: Joi.number().integer().positive().allow(null),
    joinDate: Joi.date().iso(),
    status: Joi.string().valid('active', 'inactive')
  }),

  // 修改密码验证
  changePassword: Joi.object({
    oldPassword: Joi.string().required().messages({
      'any.required': '原密码不能为空'
    }),
    newPassword: Joi.string().min(6).max(20).required().messages({
      'string.min': '新密码长度至少6位',
      'string.max': '新密码长度不能超过20位',
      'any.required': '新密码不能为空'
    })
  })
};

// 团队相关验证规则
const teamSchemas = {
  // 创建团队验证
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': '团队名称长度至少2位',
      'string.max': '团队名称长度不能超过100位',
      'any.required': '团队名称不能为空'
    }),
    level: Joi.string().valid('4', '10', '15', '30').required().messages({
      'any.only': '团队等级必须是4、10、15或30',
      'any.required': '团队等级不能为空'
    }),
    leaderId: Joi.number().integer().positive().allow(null),
    description: Joi.string().max(500).allow('')
  }),

  // 更新团队验证
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    level: Joi.string().valid('4', '10', '15', '30'),
    leaderId: Joi.number().integer().positive().allow(null),
    description: Joi.string().max(500).allow('')
  })
};

// 客户相关验证规则
const customerSchemas = {
  // 创建客户验证
  create: Joi.object({
    starLevel: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': '星级必须在1-5之间',
      'number.max': '星级必须在1-5之间',
      'any.required': '星级不能为空'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': '客户姓名长度至少2位',
      'string.max': '客户姓名长度不能超过50位',
      'any.required': '客户姓名不能为空'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '请输入正确的手机号码',
      'any.required': '客户电话不能为空'
    }),
    gender: Joi.string().valid('male', 'female').allow(null),
    age: Joi.number().integer().min(1).max(150).allow(null),
    qualification: Joi.string().max(1000).allow(''),
    ownerId: Joi.number().integer().positive().required().messages({
      'any.required': '归属销售员不能为空'
    }),
    teamId: Joi.number().integer().positive().required().messages({
      'any.required': '归属团队不能为空'
    })
  }),

  // 更新客户验证
  update: Joi.object({
    starLevel: Joi.number().integer().min(1).max(5),
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
    gender: Joi.string().valid('male', 'female').allow(null),
    age: Joi.number().integer().min(1).max(150).allow(null),
    qualification: Joi.string().max(1000).allow(''),
    ownerId: Joi.number().integer().positive(),
    teamId: Joi.number().integer().positive()
  }),

  // 批量转移客户验证
  batchTransfer: Joi.object({
    customerIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
      'array.min': '至少选择一个客户',
      'any.required': '客户ID列表不能为空'
    }),
    ownerId: Joi.number().integer().positive().required().messages({
      'any.required': '目标销售员不能为空'
    }),
    teamId: Joi.number().integer().positive().required().messages({
      'any.required': '目标团队不能为空'
    })
  })
};

// 跟进记录相关验证规则
const followRecordSchemas = {
  // 创建跟进记录验证
  create: Joi.object({
    customerId: Joi.number().integer().positive().required().messages({
      'any.required': '客户ID不能为空'
    }),
    content: Joi.string().min(1).max(2000).required().messages({
      'string.min': '跟进内容不能为空',
      'string.max': '跟进内容不能超过2000字',
      'any.required': '跟进内容不能为空'
    }),
    followTime: Joi.date().iso().default(() => new Date())
  })
};

// 分页参数验证
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).allow(''),
  sortBy: Joi.string().max(50).allow(''),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// 验证中间件
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        code: 400,
        message: '参数验证失败',
        data: { errors },
        timestamp: Date.now()
      });
    }

    req.body = value;
    next();
  };
};

// 查询参数验证中间件
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        code: 400,
        message: '查询参数验证失败',
        data: { errors },
        timestamp: Date.now()
      });
    }

    req.query = { ...req.query, ...value };
    next();
  };
};

module.exports = {
  userSchemas,
  teamSchemas,
  customerSchemas,
  followRecordSchemas,
  paginationSchema,
  validate,
  validateQuery
}; 
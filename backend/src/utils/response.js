/**
 * 统一API响应格式
 */

// 成功响应
const success = (data = null, message = 'success') => {
  return {
    code: 200,
    message,
    data,
    timestamp: Date.now()
  };
};

// 分页成功响应
const successWithPagination = (list = [], pagination = {}, message = 'success') => {
  return {
    code: 200,
    message,
    data: {
      list,
      pagination: {
        current: pagination.current || 1,
        pageSize: pagination.pageSize || 20,
        total: pagination.total || 0
      }
    },
    timestamp: Date.now()
  };
};

// 错误响应
const error = (code = 500, message = '服务器内部错误', data = null) => {
  return {
    code,
    message,
    data,
    timestamp: Date.now()
  };
};

// 常用错误响应
const badRequest = (message = '请求参数错误', data = null) => {
  return error(400, message, data);
};

const unauthorized = (message = '未授权访问') => {
  return error(401, message);
};

const forbidden = (message = '权限不足') => {
  return error(403, message);
};

const notFound = (message = '资源不存在') => {
  return error(404, message);
};

const conflict = (message = '数据冲突') => {
  return error(409, message);
};

const serverError = (message = '服务器内部错误') => {
  return error(500, message);
};

module.exports = {
  success,
  successWithPagination,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError
}; 
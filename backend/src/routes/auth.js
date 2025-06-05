const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { userSchemas } = require('../utils/validation');

const router = express.Router();

// 用户登录
router.post('/login', validate(userSchemas.login), AuthController.login);

// 获取当前用户信息
router.get('/profile', authenticateToken, AuthController.getProfile);

// 修改密码
router.put('/password', 
  authenticateToken, 
  validate(userSchemas.changePassword), 
  AuthController.changePassword
);

// 刷新token
router.post('/refresh', authenticateToken, AuthController.refreshToken);

// 登出
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router; 
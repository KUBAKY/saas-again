-- 更新用户表角色枚举，添加系统管理员角色
-- 执行时间：2024年

-- 1. 修改用户表的role字段，添加admin角色
ALTER TABLE `users` 
MODIFY COLUMN `role` enum('admin','manager','leader','sales') NOT NULL COMMENT '用户角色';

-- 2. 可选：如果需要将现有的某个manager用户设置为系统管理员
-- UPDATE `users` SET `role` = 'admin' WHERE `id` = 1 AND `role` = 'manager';

-- 3. 验证修改结果
SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'tscrm' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- 4. 查看当前用户角色分布
SELECT role, COUNT(*) as count 
FROM users 
WHERE deleted_at IS NULL 
GROUP BY role; 
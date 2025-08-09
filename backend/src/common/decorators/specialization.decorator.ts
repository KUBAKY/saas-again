import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { SpecializationGuard } from '../guards/specialization.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * 专业化权限装饰器
 * 用于检查教练的专业化类型权限
 * @param type 专业化类型：'personal' | 'group'
 */
export const RequireSpecialization = (type: 'personal' | 'group') => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, SpecializationGuard),
    SetMetadata('specialization', type),
  );
};

/**
 * 私人教练权限装饰器
 * 只有私人教练可以访问
 */
export const RequirePersonalTrainer = () => RequireSpecialization('personal');

/**
 * 团课教练权限装饰器
 * 只有团课教练可以访问
 */
export const RequireGroupInstructor = () => RequireSpecialization('group');

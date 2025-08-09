import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../../entities/coach.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class SpecializationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredSpecialization = this.reflector.get<'personal' | 'group'>(
      'specialization',
      context.getHandler(),
    );

    if (!requiredSpecialization) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 检查用户是否为教练
    const userWithCoach = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['roles'],
    });

    const isCoach = userWithCoach?.roles?.some(
      (role) =>
        role.name === 'COACH' ||
        role.name === 'PERSONAL_TRAINER' ||
        role.name === 'GROUP_FITNESS_INSTRUCTOR',
    );

    if (!isCoach) {
      throw new ForbiddenException('只有教练可以访问此资源');
    }

    // 查找教练信息
    const coach = await this.coachRepository.findOne({
      where: { employeeNumber: user.employeeNumber },
    });

    if (!coach) {
      throw new ForbiddenException('教练信息不存在');
    }

    // 检查专业化类型
    const hasSpecialization = this.checkSpecialization(
      coach,
      requiredSpecialization,
    );

    if (!hasSpecialization) {
      throw new ForbiddenException(
        `此操作需要${requiredSpecialization === 'personal' ? '私人教练' : '团课教练'}权限`,
      );
    }

    // 将教练信息添加到请求中，供后续使用
    request.coach = coach;

    return true;
  }

  private checkSpecialization(
    coach: Coach,
    requiredSpecialization: 'personal' | 'group',
  ): boolean {
    switch (requiredSpecialization) {
      case 'personal':
        return coach.isPersonalTrainer() && coach.canManagePersonalTraining();
      case 'group':
        return coach.isGroupInstructor() && coach.canManageGroupClass();
      default:
        return false;
    }
  }
}

import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { Coach } from '../../entities/coach.entity';
import { User } from '../../entities/user.entity';
export declare class SpecializationGuard implements CanActivate {
    private reflector;
    private coachRepository;
    private userRepository;
    constructor(reflector: Reflector, coachRepository: Repository<Coach>, userRepository: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private checkSpecialization;
}

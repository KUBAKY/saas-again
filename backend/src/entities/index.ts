// Base Entity
export { BaseEntity } from './base.entity';

// Core Entities
export { Brand } from './brand.entity';
export { Store } from './store.entity';
export { User } from './user.entity';
export { Role } from './role.entity';
export { Permission } from './permission.entity';

// Business Entities
export { Member } from './member.entity';
export { Coach } from './coach.entity';
export { Course } from './course.entity';
export { CourseSchedule } from './course-schedule.entity';
export { MembershipCard } from './membership-card.entity';
export { GroupClassCard } from './group-class-card.entity';
export { PersonalTrainingCard } from './personal-training-card.entity';
export { CheckIn } from './check-in.entity';
export { Booking } from './booking.entity';

import { Brand } from './brand.entity';
import { Store } from './store.entity';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Member } from './member.entity';
import { Coach } from './coach.entity';
import { Course } from './course.entity';
import { CourseSchedule } from './course-schedule.entity';
import { MembershipCard } from './membership-card.entity';
import { GroupClassCard } from './group-class-card.entity';
import { PersonalTrainingCard } from './personal-training-card.entity';
import { CheckIn } from './check-in.entity';
import { Booking } from './booking.entity';

// Entity array for TypeORM configuration
export const entities = [
  // Core entities
  Brand,
  Store,
  User,
  Role,
  Permission,

  // Business entities
  Member,
  Coach,
  Course,
  CourseSchedule,
  MembershipCard,
  GroupClassCard,
  PersonalTrainingCard,
  CheckIn,
  Booking,
];

export default entities;

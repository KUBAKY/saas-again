import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCoachDto } from './create-coach.dto';

export class UpdateCoachDto extends PartialType(
  OmitType(CreateCoachDto, ['employeeNumber', 'storeId'] as const)
) {}
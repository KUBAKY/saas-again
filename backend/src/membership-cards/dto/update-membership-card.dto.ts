import { PartialType } from '@nestjs/swagger';
import { CreateMembershipCardDto } from './create-membership-card.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateMembershipCardDto extends PartialType(
  CreateMembershipCardDto,
) {
  @IsOptional()
  @IsUUID()
  memberId?: string;
}

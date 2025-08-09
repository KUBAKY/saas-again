import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto extends PartialType(
  OmitType(CreateBrandDto, ['code'] as const)
) {}
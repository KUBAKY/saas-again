import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';

export class UpdateStoreDto extends PartialType(
  OmitType(CreateStoreDto, ['code', 'brandId'] as const),
) {}

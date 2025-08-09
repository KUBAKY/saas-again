import { PartialType } from '@nestjs/swagger';
import { CreateCheckInDto } from './create-checkin.dto';

export class UpdateCheckInDto extends PartialType(CreateCheckInDto) {}
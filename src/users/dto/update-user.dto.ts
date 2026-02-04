import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateProfileDto } from './update-profile.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['profile']),
) {
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @IsOptional()
  profile?: UpdateProfileDto;
}

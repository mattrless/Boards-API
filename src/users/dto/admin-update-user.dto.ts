import { UpdateUserDto } from './update-user.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class AdminUpdateUserDto extends UpdateUserDto {
  @IsOptional()
  @IsNumber()
  systemRoleId?: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserDto } from './update-user.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional({
    example: 2,
    description: 'System role id assigned by an admin',
  })
  @IsOptional()
  @IsNumber()
  systemRoleId?: number;
}

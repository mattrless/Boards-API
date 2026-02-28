import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    example: 'user@local.dev',
    description: 'The email of the user to be added as member.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

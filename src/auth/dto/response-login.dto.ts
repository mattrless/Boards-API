import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './respose-user.dto';
import { Expose } from 'class-transformer';

@Expose()
export class LoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    example: 'gfdhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;
}

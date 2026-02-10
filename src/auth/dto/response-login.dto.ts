import { ApiProperty } from '@nestjs/swagger';
import { LoginUserResponseDto } from './respose-login-user.dto';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @ApiProperty({ type: LoginUserResponseDto })
  @Expose()
  user: LoginUserResponseDto;

  @ApiProperty({
    example: 'gfdhbGciOiJfdre1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  access_token: string;
}

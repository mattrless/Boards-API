import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './respose-user.dto';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @ApiProperty({ type: UserResponseDto })
  @Expose()
  user: UserResponseDto;

  @ApiProperty({
    example: 'gfdhbGciOiJfdre1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  access_token: string;
}

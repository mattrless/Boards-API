import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BoardResponseDto } from './board-response.dto';
import { LoginUserResponseDto } from 'src/auth/dto/respose-login-user.dto';

export class BoardOwnerResponseDto extends BoardResponseDto {
  @ApiProperty({ type: () => LoginUserResponseDto })
  @Expose()
  @Type(() => LoginUserResponseDto)
  owner: LoginUserResponseDto;
}

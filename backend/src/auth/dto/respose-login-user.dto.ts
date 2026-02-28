import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserIdentityResponseDto } from 'src/users/dto/user-summary-response.dto';

export class LoginUserResponseDto extends UserIdentityResponseDto {
  @ApiProperty({
    example: '2026-02-06T00:20:49.552Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-06T00:20:49.552Z',
  })
  @Expose()
  updatedAt: Date;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UserIdentityResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;
}

export class UserSummaryProfileResponseDto {
  @ApiProperty({ example: 'John Doe' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @Expose()
  avatar?: string;
}

export class UserSummaryResponseDto extends UserIdentityResponseDto {
  @ApiProperty({ type: () => UserSummaryProfileResponseDto })
  @Expose()
  @Type(() => UserSummaryProfileResponseDto)
  profile: UserSummaryProfileResponseDto;
}

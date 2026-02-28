import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserSummaryResponseDto } from 'src/users/dto/user-summary-response.dto';

export class CardMemberResponseDto {
  @ApiProperty({ type: () => UserSummaryResponseDto })
  @Expose()
  @Type(() => UserSummaryResponseDto)
  user: UserSummaryResponseDto;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  assignedAt: Date;
}

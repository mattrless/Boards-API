import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserSummaryResponseDto } from 'src/users/dto/user-summary-response.dto';

export class BoardMemberRoleResponseDto {
  @ApiProperty({ example: 'admin' })
  @Expose()
  name: string;
}

export class BoardMemberResponseDto {
  @ApiProperty({ type: () => UserSummaryResponseDto })
  @Expose()
  @Type(() => UserSummaryResponseDto)
  user: UserSummaryResponseDto;

  @ApiProperty({ type: () => BoardMemberRoleResponseDto })
  @Expose()
  @Type(() => BoardMemberRoleResponseDto)
  boardRole: BoardMemberRoleResponseDto;

  @ApiProperty({
    example: false,
    description: 'Indicates whether this member is the board owner.',
  })
  @Expose()
  isOwner: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddCardMemberDto {
  @ApiProperty({
    example: 3,
    description: 'User id to add to the card.',
  })
  @IsInt()
  @Min(1)
  userId: number;
}

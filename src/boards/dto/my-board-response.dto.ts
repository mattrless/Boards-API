import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BoardResponseDto } from './board-response.dto';

export class MyBoardResponseDto extends BoardResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indicates whether the current user is the board owner.',
  })
  @Expose()
  isOwner: boolean;
}

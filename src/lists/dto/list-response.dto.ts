import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BoardResponseDto } from 'src/boards/dto/board-response.dto';

export class ListResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'To Do' })
  @Expose()
  title: string;

  @ApiProperty({ example: 1000 })
  @Expose()
  position: number;

  @ApiProperty({ type: () => BoardResponseDto })
  @Expose()
  @Type(() => BoardResponseDto)
  board: BoardResponseDto;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  updatedAt: Date;
}

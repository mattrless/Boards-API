import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ListSummaryResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'To Do' })
  @Expose()
  title: string;

  @ApiProperty({ example: 1000 })
  @Expose()
  position: number;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  updatedAt: Date;
}

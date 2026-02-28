import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BoardResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'Product Roadmap',
    description: 'The board name',
  })
  @Expose()
  name: string;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  updatedAt: Date;
}

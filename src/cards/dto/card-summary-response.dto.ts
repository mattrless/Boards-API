import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CardSummaryResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Create CRUD for users...' })
  @Expose()
  title: string;

  @ApiPropertyOptional({ example: 'The users table needs a new constraint...' })
  @Expose()
  description?: string;

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

import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ListSummaryResponseDto } from 'src/lists/dto/list-summary-response.dto';

export class CardResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Create CRUD for users...' })
  @Expose()
  title: string;

  @ApiProperty({ example: 'The users table needs a new constraint...' })
  @Expose()
  description: string;

  @ApiProperty({ example: 1000 })
  @Expose()
  position: number;

  @ApiProperty({ type: () => ListSummaryResponseDto })
  @Expose()
  @Type(() => ListSummaryResponseDto)
  list: ListSummaryResponseDto;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  updatedAt: Date;
}

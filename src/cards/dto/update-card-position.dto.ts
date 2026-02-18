import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCardPositionDto {
  @ApiPropertyOptional({
    example: 2,
    description:
      'Target list id. If omitted, the card stays in its current list.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetListId?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Id of the card placed before the target position.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  prevCardId?: number;

  @ApiPropertyOptional({
    example: 7,
    description: 'Id of the card placed after the target position.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  nextCardId?: number;
}

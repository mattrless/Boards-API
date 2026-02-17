import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateListPositionDto {
  @ApiPropertyOptional({
    example: 8,
    description: 'Id from list placed previous the target list (same board).',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  prevListId?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Id from list placed next to target list (same board).',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  nextListId?: number;
}

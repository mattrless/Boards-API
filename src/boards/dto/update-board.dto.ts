import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  @ApiPropertyOptional({
    example: 1,
    description: 'New owner user id',
  })
  @IsNumber()
  @IsOptional()
  ownerId?: number;
}

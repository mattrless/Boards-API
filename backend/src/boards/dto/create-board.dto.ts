import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({
    example: 'Product Roadmap',
    description: 'The board name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

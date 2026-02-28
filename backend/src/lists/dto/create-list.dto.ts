import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({
    example: 'Backlog',
    description: 'The title of the list',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}

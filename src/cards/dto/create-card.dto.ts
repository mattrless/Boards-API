import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({
    example: 'Create CRUD for users...',
    description: 'The title of the card',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'The users table needs a new constraint... ',
    description: 'The description of the card',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

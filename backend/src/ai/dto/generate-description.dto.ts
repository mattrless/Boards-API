import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateDescriptionDto {
  @ApiProperty({
    example: 'Implementar autenticación JWT en el módulo de usuarios',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}

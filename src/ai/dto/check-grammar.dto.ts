import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckGrammarDto {
  @ApiProperty({
    example: 'implementar autenticacion jwt para proteger rutas privadas',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

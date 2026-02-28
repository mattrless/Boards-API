import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseDescriptionDto {
  @ApiProperty({
    example: 'Implement JWT validation to protect private routes.',
  })
  @Expose()
  description: string;
}

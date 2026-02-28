import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ActionResponseDto {
  @ApiProperty({
    example: 'Operation successful',
    description: 'A message indicating the result of the action',
  })
  @Expose()
  message: string;
}

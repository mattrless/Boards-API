import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class UserResponseDto {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'admin@local.dev',
  })
  email: string;

  @ApiProperty({
    example: '2026-02-06T00:20:49.552Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-06T00:20:49.552Z',
  })
  updatedAt: Date;
}

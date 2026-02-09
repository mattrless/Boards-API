import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'admin@local.dev',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: '2026-02-06T00:20:49.552Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-06T00:20:49.552Z',
  })
  @Expose()
  updatedAt: Date;
}

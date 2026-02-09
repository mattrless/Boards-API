import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ProfileResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'https://avatar.com/user1.jpg' })
  @Expose()
  avatar?: string;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  updatedAt: Date;
}

export class SystemRoleResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'admin', description: 'The name of the role' })
  @Expose()
  name: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T10:00:00Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => ProfileResponseDto })
  @Expose()
  @Type(() => ProfileResponseDto)
  profile: ProfileResponseDto;

  @ApiProperty({ type: () => SystemRoleResponseDto })
  @Expose()
  @Type(() => SystemRoleResponseDto)
  systemRole: SystemRoleResponseDto;
}

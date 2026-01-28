import { Expose, Type } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  avatar?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class SystemRoleResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ProfileResponseDto)
  profile: ProfileResponseDto;

  @Expose()
  @Type(() => SystemRoleResponseDto)
  systemRole: SystemRoleResponseDto;
}

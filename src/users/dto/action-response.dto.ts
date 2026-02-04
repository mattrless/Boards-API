import { Expose } from 'class-transformer';

export class ActionResponseDto {
  @Expose()
  message: string;
}

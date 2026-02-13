import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserExistsPipe implements PipeTransform<number, Promise<number>> {
  constructor(private readonly prismaService: PrismaService) {}

  async transform(id: number): Promise<number> {
    const user = await this.prismaService.user.findFirst({
      where: { id: id, deletedAt: null },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return id;
  }
}

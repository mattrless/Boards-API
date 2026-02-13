import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BoardExistsPipe implements PipeTransform<number, Promise<number>> {
  constructor(private readonly prismaService: PrismaService) {}

  async transform(id: number): Promise<number> {
    const board = await this.prismaService.board.findFirst({
      where: { id: id, deletedAt: null },
      select: { id: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return id;
  }
}

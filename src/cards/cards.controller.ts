import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ListBelongsToBoardGuard } from 'src/lists/guards/list-belongs-to-board.guard';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateCardDocs } from './docs/cards.docs';

@ApiTags('Cards')
@Controller('boards/:boardId/lists/:listId/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @ApiCreateCardDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, ListBelongsToBoardGuard)
  @Permissions('card_create')
  @Post()
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.cardsService.create(boardId, listId, createCardDto);
  }

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }
}

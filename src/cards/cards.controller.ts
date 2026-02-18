import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ListBelongsToBoardGuard } from 'src/lists/guards/list-belongs-to-board.guard';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCardDocs,
  ApiFindAllCardsDocs,
  ApiFindOneCardDocs,
  ApiRemoveCardDocs,
  ApiUpdateCardDocs,
} from './docs/cards.docs';
import { CardBelongsToListGuard } from './guards/card-belongs-to-list.guard';

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

  @ApiFindAllCardsDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, ListBelongsToBoardGuard)
  @Permissions('card_read')
  @Get()
  findAll(@Param('listId', ParseIntPipe) listId: number) {
    return this.cardsService.findAll(listId);
  }

  @ApiFindOneCardDocs()
  @UseGuards(
    AuthGuard('jwt'),
    BoardPermissionsGuard,
    ListBelongsToBoardGuard,
    CardBelongsToListGuard,
  )
  @Permissions('card_read')
  @Get(':cardId')
  findOne(
    @Param('listId', ParseIntPipe) listId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.cardsService.findOne(listId, cardId);
  }

  @UseGuards(
    AuthGuard('jwt'),
    BoardPermissionsGuard,
    ListBelongsToBoardGuard,
    CardBelongsToListGuard,
  )
  @ApiUpdateCardDocs()
  @Permissions('card_update')
  @Put(':cardId')
  update(
    @Param('listId', ParseIntPipe) listId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardsService.update(listId, cardId, updateCardDto);
  }

  @ApiRemoveCardDocs()
  @UseGuards(
    AuthGuard('jwt'),
    BoardPermissionsGuard,
    ListBelongsToBoardGuard,
    CardBelongsToListGuard,
  )
  @Permissions('card_delete')
  @Delete(':cardId')
  remove(
    @Param('listId', ParseIntPipe) listId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.cardsService.remove(listId, cardId);
  }
}

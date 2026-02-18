import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { CardsService } from '../services/cards.service';
import { UpdateCardPositionDto } from '../dto/update-card-position.dto';
import { CardBelongsToBoardGuard } from '../guards/card-belongs-to-board.guard';
import { ApiUpdateCardPositionDocs } from '../docs/cards.docs';

@ApiTags('Cards')
@Controller('boards/:boardId/cards')
export class CardsPositionController {
  constructor(private readonly cardsService: CardsService) {}

  @ApiUpdateCardPositionDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, CardBelongsToBoardGuard)
  @Permissions('card_update')
  @Put(':cardId/position')
  updatePosition(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() updateCardPositionDto: UpdateCardPositionDto,
  ) {
    return this.cardsService.updatePosition(
      boardId,
      cardId,
      updateCardPositionDto,
    );
  }
}

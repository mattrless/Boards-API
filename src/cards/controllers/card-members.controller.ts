import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { CardBelongsToBoardGuard } from '../guards/card-belongs-to-board.guard';
import { CardMembersService } from '../services/card-members.service';
import { AddCardMemberDto } from '../dto/add-card-member.dto';
import {
  ApiAddCardMemberDocs,
  ApiFindCardMembersDocs,
  ApiRemoveCardMemberDocs,
} from '../docs/card-members.docs';

@ApiTags('Card members')
@Controller('boards')
export class CardMembersController {
  constructor(private readonly cardMembersService: CardMembersService) {}

  @ApiAddCardMemberDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, CardBelongsToBoardGuard)
  @Permissions('card_update')
  @Post(':boardId/cards/:cardId/members')
  addMember(
    @CurrentUser() currentUser: AuthUser,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Body() addCardMemberDto: AddCardMemberDto,
  ) {
    return this.cardMembersService.addMember(
      currentUser,
      boardId,
      cardId,
      addCardMemberDto,
    );
  }

  @ApiRemoveCardMemberDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, CardBelongsToBoardGuard)
  @Permissions('card_update')
  @Delete(':boardId/cards/:cardId/members/:targetUserId')
  removeMember(
    @CurrentUser() currentUser: AuthUser,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    return this.cardMembersService.removeMember(
      currentUser,
      boardId,
      cardId,
      targetUserId,
    );
  }

  @ApiFindCardMembersDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, CardBelongsToBoardGuard)
  @Permissions('card_read')
  @Get(':boardId/cards/:cardId/members')
  findCardMembers(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
  ) {
    return this.cardMembersService.findCardMembers(boardId, cardId);
  }
}

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
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { BoardExistsPipe } from '../pipes/board-exists.pipe';
import { EnsureBoardOwnershipGuard } from '../guards/ensure-board-ownership.guard';
import { UserExistsPipe } from 'src/users/pipes/user-exists.pipe';
import { BoardsService } from '../services/boards.service';
import {
  ApiCreateBoardDocs,
  ApiFindAllBoardsDocs,
  ApiFindOneBoardDocs,
  ApiRemoveBoardDocs,
  ApiRestoreBoardDocs,
  ApiTransferOwnershipDocs,
  ApiUpdateBoardDocs,
} from '../docs/boards.docs';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @ApiCreateBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_create')
  @Post()
  create(
    @CurrentUser('id', UserExistsPipe) ownerId: number,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardsService.create(ownerId, createBoardDto);
  }

  @ApiFindAllBoardsDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_read')
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @ApiFindOneBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_read')
  @Get(':boardId')
  findOne(@Param('boardId', ParseIntPipe, BoardExistsPipe) boardId: number) {
    return this.boardsService.findOne(boardId);
  }

  @ApiUpdateBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_update')
  @Put(':boardId')
  update(
    @Param('boardId', ParseIntPipe, BoardExistsPipe) boardId: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(boardId, updateBoardDto);
  }

  @ApiRemoveBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard, EnsureBoardOwnershipGuard)
  @Permissions('board_delete')
  @Delete(':boardId')
  remove(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.boardsService.remove(boardId);
  }

  @ApiRestoreBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_restore')
  @Put(':boardId/restore')
  restore(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.boardsService.restore(boardId);
  }

  @ApiTransferOwnershipDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, EnsureBoardOwnershipGuard)
  @Permissions('board_update_member_role')
  @Put(':boardId/transfer-ownership/:targetUserId')
  transferOwnership(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    return this.boardsService.transferOwnership(boardId, targetUserId);
  }
}

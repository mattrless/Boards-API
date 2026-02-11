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
  ApiUpdateBoardDocs,
} from '../docs/boards.docs';

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
  @UseGuards(AuthGuard('jwt'))
  @Permissions('board_read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe, BoardExistsPipe) id: number) {
    return this.boardsService.findOne(id);
  }

  @ApiUpdateBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_update')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe, BoardExistsPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, updateBoardDto);
  }

  @ApiRemoveBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard, EnsureBoardOwnershipGuard)
  @Permissions('board_delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.remove(id);
  }

  @ApiRestoreBoardDocs()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_restore')
  @Put(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.restore(id);
  }
}

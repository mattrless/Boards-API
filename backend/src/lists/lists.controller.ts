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
import { ListsService } from './lists.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateListPositionDto } from './dto/update-list-position.dto';
import { AuthGuard } from '@nestjs/passport';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateListDocs,
  ApiListsByBoardIdDocs,
  ApiFindOneListDocs,
  ApiRemoveListDocs,
  ApiUpdateListDocs,
  ApiUpdateListPositionDocs,
} from './docs/lists.docs';
import { ListBelongsToBoardGuard } from './guards/list-belongs-to-board.guard';

@ApiTags('Lists')
@Controller('boards/:boardId/lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @ApiCreateListDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard)
  @Permissions('list_create')
  @Post()
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() createListDto: CreateListDto,
  ) {
    return this.listsService.create(boardId, createListDto);
  }

  @ApiListsByBoardIdDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard)
  @Permissions('list_read')
  @Get()
  findAll(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.listsService.findAll(boardId);
  }

  @ApiFindOneListDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, ListBelongsToBoardGuard)
  @Permissions('list_read')
  @Get(':listId')
  findOne(@Param('listId', ParseIntPipe) listId: number) {
    return this.listsService.findOne(listId);
  }

  @ApiUpdateListDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, ListBelongsToBoardGuard)
  @Permissions('list_update')
  @Put(':listId')
  update(
    @Param('listId', ParseIntPipe) listId: number,
    @Body() updateListDto: UpdateListDto,
  ) {
    return this.listsService.update(listId, updateListDto);
  }

  @ApiUpdateListPositionDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, ListBelongsToBoardGuard)
  @Permissions('list_update')
  @Put(':listId/position')
  updatePosition(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('listId', ParseIntPipe) listId: number,
    @Body() updateListPositionDto: UpdateListPositionDto,
  ) {
    return this.listsService.updatePosition(
      boardId,
      listId,
      updateListPositionDto,
    );
  }

  @ApiRemoveListDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard, ListBelongsToBoardGuard)
  @Permissions('list_delete')
  @Delete(':listId')
  remove(@Param('listId', ParseIntPipe) listId: number) {
    return this.listsService.remove(listId);
  }
}

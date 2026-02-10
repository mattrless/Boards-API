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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { BoardResponseDto } from './dto/board-response.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { BoardOwnerResponseDto } from './dto/board-owner-response.dto';
import { BoardExistsPipe } from './pipes/board-exists.pipe';
import { EnsureBoardOwnershipGuard } from './guards/ensure-board-ownership.guard';
import { UserExistsPipe } from 'src/users/pipes/user-exists.pipe';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @ApiOperation({ summary: 'Create board' })
  @ApiOkResponse({
    description: 'The board has been successfully created.',
    type: BoardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_create')
  @Post()
  create(
    @CurrentUser('id', UserExistsPipe) ownerId: number,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardsService.create(ownerId, createBoardDto);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Retrieve all boards' })
  @ApiOkResponse({
    description: 'List of all boards returned successfully.',
    type: [BoardResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_read')
  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get a specific board by ID' })
  @ApiOkResponse({
    description: 'Board found and returned.',
    type: BoardOwnerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  @UseGuards(AuthGuard('jwt'))
  @Permissions('board_read')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe, BoardExistsPipe) id: number) {
    return this.boardsService.findOne(id);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update board by id' })
  @ApiOkResponse({
    description: 'The board has been successfully updated.',
    type: BoardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_update')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe, BoardExistsPipe) id: number,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardsService.update(id, updateBoardDto);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete board by id' })
  @ApiOkResponse({
    description: 'The board has been successfully deleted.',
    type: BoardResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  @UseGuards(AuthGuard('jwt'), PermissionsGuard, EnsureBoardOwnershipGuard)
  @Permissions('board_delete')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.remove(id);
  }

  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Restore board by id' })
  @ApiOkResponse({
    description: 'The board has been successfully restired.',
    type: BoardResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'Board not found.' })
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('board_restore')
  @Put(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.restore(id);
  }
}

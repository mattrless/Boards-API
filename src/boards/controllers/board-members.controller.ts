import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  ParseIntPipe,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { BoardMembersService } from '../services/board-members.service';
import { BoardPermissionsGuard } from 'src/auth/guards/board-permissions.guard';
import { AddMemberDto } from '../dto/add-member.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  ApiAddMemberDocs,
  ApiRemoveMemberDocs,
  ApiUpdateMemberRoleDocs,
} from '../docs/board-members.docs';
import { UpdateBoardMemberRoleDto } from '../dto/update-board-member-role.dto';

@Controller('boards')
export class BoardMembersController {
  constructor(private readonly boardMembersService: BoardMembersService) {}

  @ApiAddMemberDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard)
  @Permissions('board_add_members')
  @Post(':boardId/invite')
  addMember(
    // doesn't use BoardExistsPipe because of BoardPermissionsGuard
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.boardMembersService.addMember(addMemberDto, boardId);
  }

  @ApiRemoveMemberDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard)
  @Permissions('board_remove_members')
  @Delete(':boardId/remove/:targetUserId')
  removeMember(
    @CurrentUser('id') currentUserId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    return this.boardMembersService.removeMember(
      currentUserId,
      boardId,
      targetUserId,
    );
  }

  @ApiUpdateMemberRoleDocs()
  @UseGuards(AuthGuard('jwt'), BoardPermissionsGuard)
  @Permissions('board_update_member_role')
  @Put(':boardId/members/:targetUserId/role')
  updateBoardMemberRole(
    @CurrentUser('id') currentUserId: number,
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Body() updateBoardMemberRoleDto: UpdateBoardMemberRoleDto,
  ) {
    return this.boardMembersService.updateBoardMemberRole(
      currentUserId,
      boardId,
      targetUserId,
      updateBoardMemberRoleDto,
    );
  }
}

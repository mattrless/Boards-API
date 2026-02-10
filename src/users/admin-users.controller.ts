import {
  Controller,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { ActionResponseDto } from './dto/action-response.dto';
import { UserExistsPipe } from './pipes/user-exists.pipe';

@ApiTags('admin/users')
@ApiBearerAuth('JWT')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_update_any')
  @Put(':id')
  @ApiOperation({ summary: 'Update any user (Admin only)' })
  @ApiOkResponse({
    description: 'The user has been successfully updated.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  adminUpdate(
    @Param('id', ParseIntPipe, UserExistsPipe) id: number,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, adminUpdateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_delete_any')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete any user (Admin only)' })
  @ApiOkResponse({
    description: 'The user has been successfully deleted.',
    type: ActionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  remove(@Param('id', ParseIntPipe, UserExistsPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_restore')
  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  @ApiOkResponse({
    description: 'The user has been successfully restored.',
    type: ActionResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient permissions.',
  })
  @ApiResponse({ status: 404, description: 'User not found or not deleted.' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }
}

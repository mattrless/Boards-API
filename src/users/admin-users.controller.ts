import {
  Controller,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { UserExistsPipe } from './pipes/user-exists.pipe';
import {
  ApiAdminRemoveUserDocs,
  ApiAdminRestoreUserDocs,
  ApiAdminUpdateUserDocs,
} from './docs/admin-users.docs';

@ApiTags('Administrator')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_update_any')
  @Put(':id')
  @ApiAdminUpdateUserDocs()
  adminUpdate(
    @Param('id', ParseIntPipe, UserExistsPipe) id: number,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, adminUpdateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_delete_any')
  @Delete(':id')
  @ApiAdminRemoveUserDocs()
  remove(@Param('id', ParseIntPipe, UserExistsPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_restore')
  @Put(':id/restore')
  @ApiAdminRestoreUserDocs()
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }
}

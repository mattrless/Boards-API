import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { UserExistsPipe } from './pipes/user-exists.pipe';
import {
  ApiCreateUserDocs,
  ApiFindAllUsersDocs,
  ApiFindOneUserDocs,
  ApiRemoveMeDocs,
  ApiUpdateMeDocs,
} from './docs/users.docs';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateUserDocs()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('user_read')
  @Get()
  @ApiFindAllUsersDocs()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Permissions('user_read')
  @Get(':id')
  @ApiFindOneUserDocs()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Permissions('user_update_self')
  @Put('/me')
  @ApiUpdateMeDocs()
  updateMe(
    @CurrentUser('id', UserExistsPipe) userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateSelf(userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Permissions('user_delete_self')
  @Delete('/me')
  @ApiRemoveMeDocs()
  removeMe(@CurrentUser('id', UserExistsPipe) userId: number) {
    return this.usersService.remove(userId);
  }
}

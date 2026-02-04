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
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/auth/types/auth-user.type';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/me')
  userUpdate(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as AuthUser;
    const userId = user.id;
    return this.usersService.updateSelf(userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/me')
  removeMe(@Req() req: Request) {
    const user = req.user as AuthUser;
    const userId = user.id;
    return this.usersService.remove(userId);
  }
}

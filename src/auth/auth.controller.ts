import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from './dto/response-login.dto';
import { User } from '../../generated/prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials.' })
  @ApiResponse({
    status: 200,
    description: 'Login succed',
    type: LoginResponseDto,
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const user = (await this.authService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    )) as User;

    const result = {
      user,
      access_token: this.authService.generateToken(user),
    };

    return plainToInstance(LoginResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}

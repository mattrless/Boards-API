import { UsersService } from './../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../generated/prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Unauthorized');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;

    return safeUser;
  }

  generateToken(user: User) {
    // data to store in the token
    const payload = { sub: user.id };
    return this.jwtService.sign(payload);
  }
}

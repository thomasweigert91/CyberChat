import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ValidateUserDto } from './dto/validate-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/users.entity';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(dto: ValidateUserDto): Promise<User | null> {
    const user = await this.usersService.findUserByUsername(dto.username);

    if (!user) return null;

    const isPasswordCorrect = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    return isPasswordCorrect ? user : null;
  }

  login(user: Pick<User, 'id' | 'username'>) {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

import {
  Controller,
  Get,
  NotFoundException,
  Query,
  SerializeOptions,
} from '@nestjs/common';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @SerializeOptions({ type: UserResponseDto })
  async getUser(@Query('username') username: string): Promise<UserResponseDto> {
    const user = await this.usersService.findUserByUsername(username);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  @Get('all')
  @SerializeOptions({ type: UserResponseDto })
  async getAllUsers(): Promise<UserResponseDto[] | null> {
    return this.usersService.findAll();
  }
}

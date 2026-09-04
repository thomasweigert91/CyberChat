import * as bcrypt from "bcrypt";
import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[] | null> {
    return this.usersRepository.find();
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        username: username,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findUserByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException("Username already exists");
    }

    const passwordHash: string = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      id: crypto.randomUUID(),
      username: createUserDto.username,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }
}

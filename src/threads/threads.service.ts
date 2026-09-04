import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { Repository } from "typeorm";
import { Thread } from "./entities/threads.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UpdateThreadDto } from "./dto/update-thread.dto";
import { plainToInstance } from "class-transformer";
import { ThreadResponseDto } from "./dto/thread-response.dto";

@Injectable()
export class ThreadsService {
  constructor(
    @InjectRepository(Thread)
    private readonly threadsRepository: Repository<Thread>,
  ) {}

  async create(createThreadDto: CreateThreadDto, author: string) {
    const thread = this.threadsRepository.create({
      author,
      body: createThreadDto.body,
      title: createThreadDto.title,
    });

    const savedThread = await this.threadsRepository.save(thread);

    return plainToInstance(ThreadResponseDto, savedThread, {
      excludeExtraneousValues: true,
    });
  }

  update(id: string, updateThreadDto: UpdateThreadDto) {
    return this.threadsRepository
      .createQueryBuilder("updateThread")
      .update(updateThreadDto)
      .where("id = :id", { id })
      .execute();
  }

  async findAllThreads() {
    const threads = await this.threadsRepository.find({
      order: { title: "ASC" },
    });

    return plainToInstance(ThreadResponseDto, threads, {
      excludeExtraneousValues: true,
    });
  }

  async findThreadById(id: string) {
    const thread = await this.threadsRepository.findOneBy({ id });

    if (!thread) throw new NotFoundException(`Thread ${id} not found`);

    return thread;
  }

  async deleteThread(id: string) {
    await this.threadsRepository.delete({ id });
  }
}

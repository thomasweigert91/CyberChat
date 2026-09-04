import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comments.entity';
import { Repository } from 'typeorm';
import { CommentResponseDto } from './dto/comment-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(
    threadId: string,
    createCommentDto: CreateCommentDto,
    username: string,
  ) {
    const comment = this.commentsRepository.create({
      thread: { id: threadId },
      author: username,
      body: createCommentDto.body,
    });

    const savedComment = await this.commentsRepository.save(comment);

    return plainToInstance(CommentResponseDto, savedComment, {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: string) {
    const comment = await this.commentsRepository.findOneBy({ id });

    if (!comment) throw new NotFoundException(`Comment ${id} not found`);

    return plainToInstance(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  async findByThreadId(threadId: string) {
    const comments = await this.commentsRepository.find({
      where: {
        thread: {
          id: threadId,
        },
      },
    });

    if (!comments)
      throw new NotFoundException(`Comments not found for Thread ${threadId}`);

    return plainToInstance(CommentResponseDto, comments, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: string) {
    const comment = await this.commentsRepository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    await this.commentsRepository.remove(comment);

    return plainToInstance(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }
}

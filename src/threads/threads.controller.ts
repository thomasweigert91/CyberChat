import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from "@nestjs/common";
import { CommentsService } from "../comments/comments.service";
import { CreateCommentDto } from "../comments/dto/create-comment.dto";
import { ThreadsService } from "./threads.service";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { UpdateThreadDto } from "./dto/update-thread.dto";
import { ThreadResponseDto } from "./dto/thread-response.dto";
import type { Request as ExpressRequest } from "express";
import { AuthenticatedUser } from "src/auth/types/authenticated-user.type";

type AuthenticatedRequest = ExpressRequest & {
  user: AuthenticatedUser;
};

@Controller("threads")
export class ThreadsController {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  async getThreads(): Promise<ThreadResponseDto[]> {
    const threads = await this.threadsService.findAllThreads();

    return threads;
  }

  @Get(":id")
  async getThreadById(@Param("id") id: string): Promise<ThreadResponseDto> {
    const thread = await this.threadsService.findThreadById(id);
    return {
      ...thread,
      comments: await this.commentsService.findByThreadId(id),
    };
  }

  @Post()
  async createThread(
    @Body() createThreadDto: CreateThreadDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const username = req.user.username;
    return await this.threadsService.create(createThreadDto, username);
  }

  @Patch(":id")
  updateThread(
    @Body() updateThreadDto: UpdateThreadDto,
    @Param("id") id: string,
  ) {
    return this.threadsService.update(id, updateThreadDto);
  }

  @Post(":id/comments")
  async createComment(
    @Param("id") id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const username = req.user.username;
    return await this.commentsService.create(id, createCommentDto, username);
  }

  @Delete(":id")
  async deleteThread(@Param("id") id: string) {
    await this.threadsService.deleteThread(id);
  }
}

import { Controller, Delete, Get, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  getCommentById(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}

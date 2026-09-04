import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from '../../comments/dto/comment-response.dto';

export class ThreadResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;
  @ApiProperty()
  @Expose()
  author!: string;
  @ApiProperty()
  @Expose()
  body!: string;
  @ApiProperty()
  @Expose()
  title!: string;
  @ApiProperty({ type: () => [CommentResponseDto] })
  @Expose()
  @Type(() => CommentResponseDto)
  comments!: CommentResponseDto[];
}

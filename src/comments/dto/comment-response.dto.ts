import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
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
  @Type(() => Date)
  createdAt!: Date;
}

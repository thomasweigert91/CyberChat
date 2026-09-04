import { Thread } from "../../threads/entities/threads.entity";

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Thread, { onDelete: "CASCADE" })
  @JoinColumn({ name: "threadId" })
  thread!: Thread;

  @Column()
  author!: string;

  @Column()
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("threads")
export class Thread {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column()
  body!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Thread } from './threads/entities/threads.entity';
import { Comment } from './comments/entities/comments.entity';
import { User } from './users/entities/users.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL_UNPOOLED,
  ssl: { rejectUnauthorized: false },
  entities: [Thread, Comment, User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

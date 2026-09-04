import "dotenv/config";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ThreadsModule } from "./threads/threads.module";
import { CommentsModule } from "./comments/comments.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./comments/entities/comments.entity";
import { Thread } from "./threads/entities/threads.entity";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { User } from "./users/entities/users.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
      entities: [Comment, Thread, User],
      migrations: ["dist/src/migrations/*.js"],
      migrationsRun: true,
      synchronize: false,
    }),
    ThreadsModule,
    CommentsModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

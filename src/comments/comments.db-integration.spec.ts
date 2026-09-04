import { Test, TestingModule } from "@nestjs/testing";
import { CommentsController } from "./comments.controller";
import { describe, beforeAll, afterAll, beforeEach, it, expect } from "vitest";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comments.entity";
import { Thread } from "../threads/entities/threads.entity";
import { CommentsService } from "./comments.service";
import { INestApplication } from "@nestjs/common";
import { Repository } from "typeorm";
import request from "supertest";

describe("CommentsController (database integration)", () => {
  let app: INestApplication;
  let commentRepository: Repository<Comment>;
  let threadRepository: Repository<Thread>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "better-sqlite3",
          database: ":memory:",
          entities: [Comment, Thread],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Comment, Thread]),
      ],
      controllers: [CommentsController],
      providers: [CommentsService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    commentRepository = moduleFixture.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    threadRepository = moduleFixture.get<Repository<Thread>>(
      getRepositoryToken(Thread),
    );
  });

  beforeEach(async () => {
    // Clean up tables before each test
    await commentRepository.clear();
    await threadRepository.clear();
  });

  it("GET /comments/:id retrieves a comment from the in-memory SQLite database", async () => {
    const thread = await threadRepository.save({
      title: "Test Thread",
      author: "john_doe",
      body: "Thread body",
    });

    const comment = await commentRepository.save({
      thread: thread,
      author: "alice",
      body: "Great thread!",
    });

    const response = await request(app.getHttpServer())
      .get(`/comments/${comment.id}`)
      .expect(200);

    // 3. Assert HTTP response matches DB content
    expect(response.body).toMatchObject({
      id: comment.id,
      author: "alice",
      body: "Great thread!",
    });
  });

  it("GET /comments/:id returns 404 NOT FOUND if comment does not exist in DB", async () => {
    const fakeUuid = "00000000-0000-0000-0000-000000000000";

    await request(app.getHttpServer()).get(`/comments/${fakeUuid}`).expect(404);
  });

  it("DELETE /comments/:id removes the comment from the in-memory database", async () => {
    // 1. Seed a Thread and Comment into SQLite DB
    const thread = await threadRepository.save({
      title: "Test Thread",
      author: "john_doe",
      body: "Thread body",
    });

    const comment = await commentRepository.save({
      thread: thread,
      author: "bob",
      body: "To be deleted",
    });

    await request(app.getHttpServer())
      .delete(`/comments/${comment.id}`)
      .expect(200);

    // 3. Verify comment is deleted in the real SQLite DB schema
    const deletedComment = await commentRepository.findOneBy({
      id: comment.id,
    });
    expect(deletedComment).toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});

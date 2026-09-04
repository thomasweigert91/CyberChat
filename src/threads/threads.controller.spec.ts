import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import request from "supertest";
import {
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  it,
  expect,
  vi,
} from "vitest";
import { ThreadsController } from "./threads.controller";
import { ThreadsService } from "./threads.service";
import { CommentsService } from "../comments/comments.service";
import { Thread } from "./entities/threads.entity";
import { Comment } from "../comments/entities/comments.entity";
import { NextFunction, Request } from "express";

const mockThreadRepository = {
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOneBy: vi.fn(),
  delete: vi.fn(),
};

const mockCommentsRepository = {
  find: vi.fn(),
  findOneBy: vi.fn(),
};

describe("ThreadsController (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ThreadsController],
      providers: [
        ThreadsService,
        CommentsService,
        {
          provide: getRepositoryToken(Thread),
          useValue: mockThreadRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentsRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Middleware to populate req.user for authenticated routes
    app.use((req: Request, _res: any, next: NextFunction) => {
      req.user = { username: "testuser", userId: "1" };
      next();
    });

    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /threads with a valid body returns 201 Created", async () => {
    const createThreadDto = {
      title: "Integration Test Thread",
      body: "Testing the thread controller integration",
    };

    const createdThread = {
      title: "Integration Test Thread",
      body: "Testing the thread controller integration",
      author: "testuser",
    };

    const savedThread = {
      id: "thread-123",
      ...createdThread,
      createdAt: new Date(),
    };

    mockThreadRepository.create.mockReturnValue(createdThread);
    mockThreadRepository.save.mockResolvedValue(savedThread);

    const response = await request(app.getHttpServer())
      .post("/threads")
      .send(createThreadDto)
      .expect(201);

    expect(mockThreadRepository.create).toHaveBeenCalledWith({
      title: "Integration Test Thread",
      body: "Testing the thread controller integration",
      author: "testuser",
    });
    expect(mockThreadRepository.save).toHaveBeenCalledWith(createdThread);
    expect(response.body).toMatchObject({
      id: "thread-123",
      title: "Integration Test Thread",
      body: "Testing the thread controller integration",
      author: "testuser",
    });
  });

  it("POST /threads with missing required fields returns 400 Bad Request", async () => {
    const invalidDto = {
      body: "Missing title field",
    };

    await request(app.getHttpServer())
      .post("/threads")
      .send(invalidDto)
      .expect(400);

    expect(mockThreadRepository.save).not.toHaveBeenCalled();
  });

  it("GET /threads/:id with a valid ID returns 200 OK along with the thread payload", async () => {
    const mockThread = {
      id: "thread-123",
      title: "Existing Thread",
      body: "Content",
      author: "testuser",
      createdAt: new Date().toISOString(),
    };

    mockThreadRepository.findOneBy.mockResolvedValue(mockThread);
    mockCommentsRepository.find.mockResolvedValue([]);

    const response = await request(app.getHttpServer())
      .get("/threads/thread-123")
      .expect(200);

    expect(mockThreadRepository.findOneBy).toHaveBeenCalledWith({
      id: "thread-123",
    });
    expect(mockCommentsRepository.find).toHaveBeenCalledWith({
      where: { thread: { id: "thread-123" } },
    });
    expect(response.body).toMatchObject({
      id: "thread-123",
      title: "Existing Thread",
      body: "Content",
      author: "testuser",
      comments: [],
    });
  });

  it("GET /threads/:id for a non-existent thread returns 404 Not Found", async () => {
    mockThreadRepository.findOneBy.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get("/threads/non-existent-id")
      .expect(404);

    expect(mockThreadRepository.findOneBy).toHaveBeenCalledWith({
      id: "non-existent-id",
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

import { Test } from "@nestjs/testing";
import { ThreadsService } from "./threads.service";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Thread } from "./entities/threads.entity";
import { NotFoundException } from "@nestjs/common";

const mockThreadRepository = {
  create: vi.fn(),
  save: vi.fn(),
  find: vi.fn(),
  findOneBy: vi.fn(),
  delete: vi.fn(),
};

describe("ThreadsService", () => {
  let service: ThreadsService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ThreadsService,
        {
          provide: getRepositoryToken(Thread),
          useValue: mockThreadRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<ThreadsService>(ThreadsService);
  });

  describe("findAllThreads", () => {
    it("returns an array of threads provided by the mock repository", async () => {
      const mockThreads = [
        {
          id: "thread-1",
          title: "First Thread",
          body: "Hello world",
          author: "alice",
          createdAt: new Date(),
        },
        {
          id: "thread-2",
          title: "Second Thread",
          body: "Another thread",
          author: "bob",
          createdAt: new Date(),
        },
      ];

      mockThreadRepository.find.mockResolvedValue(mockThreads);

      const result = await service.findAllThreads();

      expect(mockThreadRepository.find).toHaveBeenCalledWith({
        order: { title: "ASC" },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "thread-1",
        title: "First Thread",
        body: "Hello world",
        author: "alice",
      });
    });
  });

  describe("findThreadById", () => {
    it("returns the correct thread object when given a valid ID", async () => {
      const mockThread = {
        id: "thread-1",
        title: "First Thread",
        body: "Hello world",
        author: "alice",
        createdAt: new Date(),
      };

      mockThreadRepository.findOneBy.mockResolvedValue(mockThread);

      const result = await service.findThreadById("thread-1");

      expect(mockThreadRepository.findOneBy).toHaveBeenCalledWith({
        id: "thread-1",
      });
      expect(result).toEqual(mockThread);
    });

    it("throws a NotFoundException when the thread ID does not exist", async () => {
      mockThreadRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findThreadById("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockThreadRepository.findOneBy).toHaveBeenCalledWith({
        id: "invalid-id",
      });
    });
  });

  describe("create", () => {
    it("successfully passes the DTO to the repository's save method and returns the new thread", async () => {
      const createThreadDto = {
        title: "New Thread",
        body: "New Thread Body",
      };
      const author = "alice";
      const createdThread = {
        title: "New Thread",
        body: "New Thread Body",
        author: "alice",
      };
      const savedThread = {
        id: "thread-100",
        ...createdThread,
        createdAt: new Date(),
      };

      mockThreadRepository.create.mockReturnValue(createdThread);
      mockThreadRepository.save.mockResolvedValue(savedThread);

      const result = await service.create(createThreadDto, author);

      expect(mockThreadRepository.create).toHaveBeenCalledWith({
        author: "alice",
        body: "New Thread Body",
        title: "New Thread",
      });
      expect(mockThreadRepository.save).toHaveBeenCalledWith(createdThread);
      expect(result).toMatchObject({
        id: "thread-100",
        title: "New Thread",
        body: "New Thread Body",
        author: "alice",
      });
    });
  });

  describe("deleteThread", () => {
    it("triggers the repository's delete method with the correct ID", async () => {
      mockThreadRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteThread("thread-1");

      expect(mockThreadRepository.delete).toHaveBeenCalledWith({
        id: "thread-1",
      });
    });
  });
});

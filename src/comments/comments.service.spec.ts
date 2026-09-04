import { Test } from "@nestjs/testing";
import { CommentsService } from "./comments.service";
import { describe, beforeEach, it, expect, vi } from "vitest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Comment } from "./entities/comments.entity";
import { NotFoundException } from "@nestjs/common";

const mockCommentsRepository = {
  create: vi.fn(),
  save: vi.fn(),
  findOneBy: vi.fn(),
  find: vi.fn(),
  remove: vi.fn(),
};

describe("CommentsService", () => {
  let commentsService: CommentsService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentsRepository,
        },
      ],
    }).compile();

    commentsService = moduleRef.get<CommentsService>(CommentsService);
  });

  describe("create", () => {
    it("correctly associates the comment with a Thread ID before saving it to the repository", async () => {
      const threadId = "thread-123";
      const createCommentDto = { body: "This is a comment" };
      const username = "john_doe";

      const createdComment = {
        thread: { id: threadId },
        author: username,
        body: createCommentDto.body,
      };

      const savedComment = {
        id: "comment-1",
        ...createdComment,
        createdAt: new Date(),
      };

      mockCommentsRepository.create.mockReturnValue(createdComment);
      mockCommentsRepository.save.mockResolvedValue(savedComment);

      const result = await commentsService.create(
        threadId,
        createCommentDto,
        username,
      );

      expect(mockCommentsRepository.create).toHaveBeenCalledWith({
        thread: { id: threadId },
        author: username,
        body: createCommentDto.body,
      });
      expect(mockCommentsRepository.save).toHaveBeenCalledWith(createdComment);
      expect(result).toMatchObject({
        id: "comment-1",
        body: "This is a comment",
        author: "john_doe",
      });
    });
  });

  describe("findById", () => {
    it("retrieves a comment by its ID", async () => {
      const mockComment = {
        id: "1",
        body: "Test comment",
        author: "user1",
        thread: { id: "thread-1" },
        createdAt: new Date(),
      };

      mockCommentsRepository.findOneBy.mockResolvedValue(mockComment);

      const result = await commentsService.findById("1");

      expect(mockCommentsRepository.findOneBy).toHaveBeenCalledWith({
        id: "1",
      });
      expect(result).toMatchObject({
        id: "1",
        body: "Test comment",
        author: "user1",
      });
    });

    it("throws a NotFoundException if comment does not exist", async () => {
      mockCommentsRepository.findOneBy.mockResolvedValue(null);

      await expect(commentsService.findById("999")).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCommentsRepository.findOneBy).toHaveBeenCalledWith({
        id: "999",
      });
    });
  });

  describe("findByThreadId", () => {
    it("returns comments for a specific thread ID", async () => {
      const mockComments = [
        {
          id: "comment-1",
          body: "Comment 1",
          author: "user1",
          thread: { id: "thread-1" },
          createdAt: new Date(),
        },
      ];

      mockCommentsRepository.find.mockResolvedValue(mockComments);

      const result = await commentsService.findByThreadId("thread-1");

      expect(mockCommentsRepository.find).toHaveBeenCalledWith({
        where: {
          thread: {
            id: "thread-1",
          },
        },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe("delete", () => {
    it("removes a comment if it exists", async () => {
      const mockComment = {
        id: "comment-1",
        body: "Comment 1",
        author: "user1",
        thread: { id: "thread-1" },
        createdAt: new Date(),
      };

      mockCommentsRepository.findOneBy.mockResolvedValue(mockComment);
      mockCommentsRepository.remove.mockResolvedValue(mockComment);

      const result = await commentsService.delete("comment-1");

      expect(mockCommentsRepository.findOneBy).toHaveBeenCalledWith({
        id: "comment-1",
      });
      expect(mockCommentsRepository.remove).toHaveBeenCalledWith(mockComment);
      expect(result).toMatchObject({
        id: "comment-1",
        body: "Comment 1",
        author: "user1",
      });
    });

    it("throws NotFoundException if comment to delete does not exist", async () => {
      mockCommentsRepository.findOneBy.mockResolvedValue(null);

      await expect(commentsService.delete("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

export type Thread = {
  id: string;
  title: string;
  author: string;
  body: string;
  createdAt: Date;
};

export type Comment = {
  id: string;
  threadId: string;
  author: string;
  body: string;
  createdAt: Date;
};

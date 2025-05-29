export interface Board {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  postId: string;
}

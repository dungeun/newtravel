export interface Section {
  id: string;
  type: 'latest-posts' | 'banner' | 'content' | 'custom';
  boardId?: string; // 최신 게시물용
  position: number;
  config: {
    title?: string;
    limit?: number;
    layout?: 'grid' | 'list' | 'card';
    customComponent?: string;
  };
  isActive: boolean;
}

import { api } from '../config/api';

export interface Comment {
  id: number;
  article_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const commentsService = {
  getAll: async (params?: {
    status?: string;
    article_id?: number;
  }): Promise<Comment[]> => {
    const response = await api.get<Comment[]>('/comments', { params });
    return response.data;
  },

  updateStatus: async (id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Comment> => {
    const response = await api.put<Comment>(`/comments/${id}`, { status });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};


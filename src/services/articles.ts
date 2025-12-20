import { api } from '../config/api';

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string | null;
  category_id: number | null;
  category_name?: string;
  tags?: string;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  author_id: number | null;
  scheduled_publish_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

export const articlesService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: number;
    search?: string;
  }): Promise<ArticlesResponse> => {
    const response = await api.get<ArticlesResponse>('/articles', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Article> => {
    const response = await api.get<Article>(`/articles/${id}`);
    return response.data;
  },

  create: async (article: Partial<Article>): Promise<Article> => {
    const response = await api.post<Article>('/articles', article);
    return response.data;
  },

  update: async (id: number, article: Partial<Article>): Promise<Article> => {
    const response = await api.put<Article>(`/articles/${id}`, article);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },
};


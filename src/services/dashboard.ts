import { api } from '../config/api';

export interface Article {
  id: number;
  title: string;
  views?: number;
  status?: string;
  created_at: string;
  category_name?: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalCategories: number;
  totalTags: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  newsletterSubscribers: number;
  trendingArticles?: Article[];
  recentArticles?: Article[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};


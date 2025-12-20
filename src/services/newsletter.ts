import { api } from '../config/api';

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

export const newsletterService = {
  getAll: async (): Promise<NewsletterSubscriber[]> => {
    const response = await api.get<NewsletterSubscriber[]>('/newsletter/subscribers');
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/newsletter/subscribers/${id}`);
  },
};


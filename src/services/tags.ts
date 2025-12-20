import { api } from '../config/api';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export const tagsService = {
  getAll: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  },

  getById: async (id: number): Promise<Tag> => {
    const response = await api.get<Tag>(`/tags/${id}`);
    return response.data;
  },

  create: async (tag: Partial<Tag>): Promise<Tag> => {
    const response = await api.post<Tag>('/tags', tag);
    return response.data;
  },

  update: async (id: number, tag: Partial<Tag>): Promise<Tag> => {
    const response = await api.put<Tag>(`/tags/${id}`, tag);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};


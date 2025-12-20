import { api } from '../config/api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://64.23.169.136:9988/api';

export type MediaItem = {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
};

export type UploadResponse = {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  message: string;
};

export const mediaService = {
  getAll: async (): Promise<MediaItem[]> => {
    const response = await api.get<MediaItem[]>('/media');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await axios.post<UploadResponse>(
      `${API_BASE_URL}/media/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/media/${id}`);
  },
};


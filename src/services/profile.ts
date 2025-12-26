import { api } from '../config/api';

export interface UserProfile {
  id: number;
  username: string | null;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> => {
    const response = await api.put<{ message: string; user: UserProfile }>('/auth/profile', data);
    return response.data;
  },
};


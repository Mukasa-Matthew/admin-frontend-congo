import { api } from '../config/api';

export interface SiteSetting {
  value: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'number';
  description: string;
}

export interface SiteSettingsData {
  [key: string]: SiteSetting;
}

export interface PublicSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_logo_url: string;
  site_favicon_url: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  footer_copyright: string;
}

export const settingsService = {
  getSettings: async (): Promise<SiteSettingsData> => {
    const response = await api.get<SiteSettingsData>('/settings');
    return response.data;
  },

  updateSettings: async (settings: Record<string, string>): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/settings', settings);
    return response.data;
  },

  getPublicSettings: async (): Promise<PublicSettings> => {
    const response = await api.get<PublicSettings>('/settings/public');
    return response.data;
  },
};


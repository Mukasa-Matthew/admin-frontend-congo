import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import { 
  MdSave, 
  MdCheckCircle, 
  MdError,
  MdPublic,
  MdEmail,
  MdLink,
  MdImage,
  MdDescription
} from 'react-icons/md';

export default function SiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading, isError, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsService.getSettings(),
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Settings updated successfully!');
      setErrorMessage('');
      // Invalidate both admin and public settings queries
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update settings');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  useEffect(() => {
    if (settingsData) {
      const initialSettings: Record<string, string> = {};
      Object.keys(settingsData).forEach((key) => {
        initialSettings[key] = settingsData[key].value || '';
      });
      setSettings(initialSettings);
    }
  }, [settingsData]);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settingsData || Object.keys(settingsData).length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MdError className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No settings found</p>
          <p className="text-gray-500 text-sm">Please ensure the database migration has been run.</p>
        </div>
      </div>
    );
  }

  const settingGroups = [
    {
      title: 'Basic Information',
      icon: MdPublic,
      settings: ['site_name', 'site_tagline', 'site_description'],
    },
    {
      title: 'Branding',
      icon: MdImage,
      settings: ['site_logo_url', 'site_favicon_url'],
    },
    {
      title: 'Contact Information',
      icon: MdEmail,
      settings: ['contact_email', 'contact_phone'],
    },
    {
      title: 'Social Media',
      icon: MdLink,
      settings: ['facebook_url', 'twitter_url', 'instagram_url', 'youtube_url'],
    },
    {
      title: 'Footer',
      icon: MdDescription,
      settings: ['footer_copyright'],
    },
  ];

  const getSettingLabel = (key: string): string => {
    const labels: Record<string, string> = {
      site_name: 'Site Name',
      site_tagline: 'Site Tagline',
      site_description: 'Site Description',
      site_logo_url: 'Logo URL',
      site_favicon_url: 'Favicon URL',
      contact_email: 'Contact Email',
      contact_phone: 'Contact Phone',
      facebook_url: 'Facebook URL',
      twitter_url: 'Twitter/X URL',
      instagram_url: 'Instagram URL',
      youtube_url: 'YouTube URL',
      footer_copyright: 'Footer Copyright Text',
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Site Settings</h1>
        <p className="text-gray-600">Manage your website branding, contact information, and social media links</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="card bg-green-50 border-green-200 animate-scale-in">
          <div className="flex items-center space-x-3">
            <MdCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="card bg-red-50 border-red-200 animate-scale-in">
          <div className="flex items-center space-x-3">
            <MdError className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="card bg-red-50 border-red-200 animate-scale-in">
          <div className="flex items-center space-x-3">
            <MdError className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold mb-1">Failed to load settings</p>
              <p className="text-red-700 text-sm">
                {error && (error as any).response?.status === 404
                  ? 'The settings API endpoint is not available. Please ensure the backend has been deployed with the latest changes.'
                  : 'Unable to load site settings. Please refresh the page or contact support.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {settingGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
                  <p className="text-sm text-gray-500">Configure {group.title.toLowerCase()}</p>
                </div>
              </div>

              <div className="space-y-4">
                {group.settings.map((key) => {
                  const setting = settingsData?.[key];
                  if (!setting) return null;

                  return (
                    <div key={key}>
                      <label htmlFor={key} className="block text-sm font-semibold text-gray-700 mb-2">
                        {getSettingLabel(key)}
                      </label>
                      {setting.type === 'textarea' ? (
                        <textarea
                          id={key}
                          name={key}
                          value={settings[key] || ''}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleChange(key, e.target.value);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          rows={4}
                          className="input-modern cursor-text"
                          placeholder={setting.description}
                          autoComplete="off"
                        />
                      ) : (
                        <input
                          id={key}
                          name={key}
                          type={setting.type === 'email' ? 'email' : setting.type === 'url' ? 'url' : 'text'}
                          value={settings[key] || ''}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleChange(key, e.target.value);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onFocus={(e) => {
                            e.target.select();
                          }}
                          className="input-modern cursor-text"
                          placeholder={setting.description}
                          autoComplete="off"
                        />
                      )}
                      {setting.description && (
                        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary inline-flex items-center"
          >
            {updateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <MdSave className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


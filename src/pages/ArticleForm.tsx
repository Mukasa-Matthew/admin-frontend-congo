import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import { categoriesService } from '../services/categories';
// import { tagsService } from '../services/tags'; // Reserved for future tag selection feature
import { mediaService } from '../services/media';
import { MdCloudUpload, MdLink, MdClose } from 'react-icons/md';

interface Article {
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

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    excerpt: '',
    body: '',
    featured_image: null,
    category_id: null,
    meta_title: '',
    meta_description: '',
    status: 'draft',
    scheduled_publish_date: null,
  });

  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: article } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articlesService.getById(Number(id)),
    enabled: isEdit,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  });

  // Tags query - reserved for future tag selection feature
  // const { data: tags } = useQuery({
  //   queryKey: ['tags'],
  //   queryFn: () => tagsService.getAll(),
  // });

  useEffect(() => {
    if (article) {
      setFormData(article);
      // Set preview URL if featured image exists
      if (article.featured_image) {
        setPreviewUrl(article.featured_image);
        // Determine upload method based on whether it's a URL or base64
        setUploadMethod(article.featured_image.startsWith('http') ? 'url' : 'upload');
      }
    }
  }, [article]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setUploadError('Please select an image or video file');
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File size must be less than 100MB');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const response = await mediaService.upload(file);
      setFormData({ ...formData, featured_image: response.url });
      setPreviewUrl(response.url);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, featured_image: url });
    setPreviewUrl(url);
  };

  const clearImage = () => {
    setFormData({ ...formData, featured_image: null });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const mutation = useMutation({
    mutationFn: (data: Partial<Article>) =>
      isEdit
        ? articlesService.update(Number(id), data)
        : articlesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      navigate('/articles');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Article' : 'New Article'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
          <textarea
            value={formData.excerpt || ''}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body *</label>
          <textarea
            value={formData.body || ''}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            required
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image / Video
          </label>
          
          {/* Upload Method Toggle */}
          <div className="flex space-x-2 mb-4">
            <button
              type="button"
              onClick={() => setUploadMethod('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition ${
                uploadMethod === 'upload'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MdCloudUpload className="w-5 h-5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition ${
                uploadMethod === 'url'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MdLink className="w-5 h-5" />
              <span>Use URL</span>
            </button>
          </div>

          {/* Upload Method Content */}
          {uploadMethod === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  {uploading ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <MdCloudUpload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Images (JPG, PNG, GIF, WebP) or Videos (MP4, WebM) up to 100MB
                      </p>
                    </>
                  )}
                </label>
              </div>
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {uploadError}
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="url"
                value={formData.featured_image || ''}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct URL to an image or video
              </p>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="mt-4 relative">
              <div className="relative inline-block">
                {previewUrl.match(/\.(mp4|webm|mpeg|quicktime|avi)$/i) ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-w-full max-h-64 rounded-lg border border-gray-300"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded-lg border border-gray-300 object-cover"
                    onError={() => {
                      // If image fails to load, it might be a base64 string
                      if (!previewUrl.startsWith('data:')) {
                        setPreviewUrl(null);
                      }
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                  title="Remove image"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">Select category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status || 'draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Publish Date</label>
          <input
            type="datetime-local"
            value={formData.scheduled_publish_date || ''}
            onChange={(e) => setFormData({ ...formData, scheduled_publish_date: e.target.value || null })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
          <input
            type="text"
            value={formData.meta_title || ''}
            onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
          <textarea
            value={formData.meta_description || ''}
            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Article' : 'Create Article'}
          </button>
        </div>
      </form>
    </div>
  );
}


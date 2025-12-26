import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import { categoriesService } from '../services/categories';
// import { tagsService } from '../services/tags'; // Reserved for future tag selection feature
import { mediaService } from '../services/media';
import { MdCloudUpload, MdLink, MdClose } from 'react-icons/md';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  order?: number;
}

interface Article {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  featured_image: string | null;
  media?: MediaItem[];
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
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
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

  // Helper function to convert ISO date string to datetime-local format
  const convertToDatetimeLocal = (dateString: string | null | undefined): string | null => {
    if (!dateString) return null;
    
    try {
      const trimmed = String(dateString).trim();
      
      // If already in datetime-local format (YYYY-MM-DDTHH:MM), return as is
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      
      // Handle ISO format with milliseconds and timezone (YYYY-MM-DDTHH:MM:SS.sssZ)
      // Example: 2025-12-23T23:27:00.000Z
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(trimmed)) {
        // Extract date and time parts directly from the string
        const dateTimePart = trimmed.replace('Z', '').replace(/\.\d{3}$/, '');
        // Convert to datetime-local format (remove seconds)
        const parts = dateTimePart.split('T');
        if (parts.length === 2) {
          const timeParts = parts[1].split(':');
          if (timeParts.length >= 2) {
            return `${parts[0]}T${timeParts[0]}:${timeParts[1]}`;
          }
        }
      }
      
      // Handle ISO format without milliseconds but with timezone (YYYY-MM-DDTHH:MM:SSZ)
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(trimmed)) {
        const dateTimePart = trimmed.replace('Z', '');
        const parts = dateTimePart.split('T');
        if (parts.length === 2) {
          const timeParts = parts[1].split(':');
          if (timeParts.length >= 2) {
            return `${parts[0]}T${timeParts[0]}:${timeParts[1]}`;
          }
        }
      }
      
      // Parse the date string (handles ISO format with timezone)
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', trimmed);
        return null;
      }
      
      // Convert to local datetime-local format (YYYY-MM-DDTHH:MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error converting date to datetime-local format:', error, 'Input:', dateString);
      return null;
    }
  };

  // Helper to detect media type
  const detectMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|mpeg|mpg|mov|quicktime|avi|wmv|flv|ogv|m4v|mkv)(\?.*)?$/i;
    if (videoExtensions.test(url) || url.includes('video/') || url.startsWith('data:video/')) {
      return 'video';
    }
    return 'image';
  };

  useEffect(() => {
    if (article) {
      // Convert scheduled_publish_date from ISO format to datetime-local format
      const formattedArticle = {
        ...article,
        scheduled_publish_date: convertToDatetimeLocal(article.scheduled_publish_date),
      };
      setFormData(formattedArticle);
      
      // Load media items
      if (article.media && Array.isArray(article.media) && article.media.length > 0) {
        setMediaItems(article.media.map((item: { url: string; type?: 'image' | 'video'; order?: number }, index: number) => ({
          url: item.url,
          type: item.type || detectMediaType(item.url),
          order: item.order !== undefined ? item.order : index,
        })));
      } else if (article.featured_image) {
        // Fallback to featured_image for backward compatibility
        setMediaItems([{
          url: article.featured_image,
          type: detectMediaType(article.featured_image),
          order: 0,
        }]);
      } else {
        setMediaItems([]);
      }
      
      // Determine upload method
      if (article.featured_image || (article.media && article.media.length > 0)) {
        const firstMedia = article.media?.[0]?.url || article.featured_image;
        setUploadMethod(firstMedia?.startsWith('http') ? 'url' : 'upload');
      }
    }
  }, [article]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (mediaItems.length + files.length > 8) {
      setUploadError(`Maximum 8 media items allowed. You can add ${8 - mediaItems.length} more.`);
      return;
    }

    // Validate all files
    const validFiles: File[] = [];
    for (const file of files) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
        setUploadError(`${file.name} is not a valid image or video file`);
        continue;
    }

      // Videos must be under 100MB
      if (isVideo && file.size > 100 * 1024 * 1024) {
        setUploadError(`${file.name} exceeds 100MB limit for videos`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadError(null);
    setUploading(true);

    try {
      const uploadPromises = validFiles.map(file => mediaService.upload(file));
      const responses = await Promise.all(uploadPromises);
      
      const newMediaItems = responses.map((response, index) => ({
        url: response.url,
        type: detectMediaType(response.url),
        order: mediaItems.length + index,
      }));

      setMediaItems([...mediaItems, ...newMediaItems]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = (url: string) => {
    if (!url.trim()) return;
    
    if (mediaItems.length >= 8) {
      setUploadError('Maximum 8 media items allowed');
      return;
    }

    const newItem: MediaItem = {
      url: url.trim(),
      type: detectMediaType(url.trim()),
      order: mediaItems.length,
    };

    setMediaItems([...mediaItems, newItem]);
    setUploadError(null);
  };

  const removeMediaItem = (index: number) => {
    const newItems = mediaItems.filter((_, i) => i !== index).map((item, i) => ({
      ...item,
      order: i,
    }));
    setMediaItems(newItems);
  };

  const reorderMedia = (fromIndex: number, toIndex: number) => {
    const newItems = [...mediaItems];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setMediaItems(newItems.map((item, index) => ({ ...item, order: index })));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderMedia(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
    // Clean up the data before sending - convert empty strings to null
    // The backend will handle datetime-local format (YYYY-MM-DDTHH:MM) correctly
    const cleanedData = {
      ...formData,
      scheduled_publish_date: formData.scheduled_publish_date && formData.scheduled_publish_date.trim() !== '' 
        ? formData.scheduled_publish_date 
        : null,
      // Include media array - backend will use first item as featured_image
      media: mediaItems.length > 0 ? mediaItems.map((item, index) => ({
        url: item.url,
        type: item.type,
        order: index,
      })) : undefined,
      // Keep featured_image for backward compatibility (use first media item)
      featured_image: mediaItems.length > 0 ? mediaItems[0].url : formData.featured_image,
    };
    mutation.mutate(cleanedData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEdit ? 'Edit Article' : 'Create New Article'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Update your article details' : 'Fill in the details to create a new article'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="input-modern"
            placeholder="Enter article title..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
          <textarea
            value={formData.excerpt || ''}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="input-modern resize-none"
            placeholder="Brief summary of the article..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Body <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.body || ''}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            required
            rows={15}
            className="input-modern resize-none font-mono text-sm"
            placeholder="Write your article content here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Gallery (Images & Videos)
            <span className="text-xs font-normal text-gray-500 ml-2">(Maximum 8 items, Videos max 100MB each)</span>
          </label>
          
          {/* Upload Method Toggle */}
          <div className="flex space-x-3 mb-4">
            <button
              type="button"
              onClick={() => setUploadMethod('upload')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                uploadMethod === 'upload'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <MdCloudUpload className="w-5 h-5" />
              <span>Upload Files</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                uploadMethod === 'url'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <MdLink className="w-5 h-5" />
              <span>Add URL</span>
            </button>
          </div>

          {/* Upload Method Content */}
          {uploadMethod === 'upload' ? (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-primary-500 transition-all bg-gradient-to-br from-gray-50 to-white hover:from-primary-50 hover:to-white"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-primary-500', 'bg-primary-50');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary-500', 'bg-primary-50');
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    const fakeEvent = { target: { files } } as any;
                    handleFileSelect(fakeEvent);
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  disabled={uploading || mediaItems.length >= 8}
                  multiple
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
                        Click to upload or drag and drop multiple files
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        Images (JPG, PNG, GIF, WebP) or Videos (MP4, WebM) up to 100MB each
                        <br />
                        {mediaItems.length > 0 && (
                          <span className="text-primary-600 font-semibold">
                            {mediaItems.length} / 8 items added
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </label>
              </div>
              {uploadError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
                  {uploadError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex space-x-2">
              <input
                type="url"
                  id="url-input"
                  placeholder="https://example.com/image.jpg or video.mp4"
                  className="input-modern flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      handleUrlAdd(input.value);
                      input.value = '';
                    }
                  }}
              />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('url-input') as HTMLInputElement;
                    if (input) {
                      handleUrlAdd(input.value);
                      input.value = '';
                    }
                  }}
                  disabled={mediaItems.length >= 8}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Add URL
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Enter a direct URL and press Enter or click Add URL
              </p>
            </div>
          )}

          {/* Media Grid Preview */}
          {mediaItems.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Media Items ({mediaItems.length} / 8)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative group border-2 rounded-xl overflow-hidden bg-gray-100 ${
                      draggedIndex === index ? 'opacity-50 border-primary-500' : 'border-gray-200'
                    } transition-all cursor-move hover:border-primary-400 hover:shadow-glow`}
                  >
                    <div className="aspect-square relative">
                      {item.type === 'video' ? (
                  <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                  />
                ) : (
                  <img
                          src={item.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {item.type === 'video' ? 'VIDEO' : 'IMAGE'}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                        #{index + 1}
                      </div>
                <button
                  type="button"
                        onClick={() => removeMediaItem(index)}
                        className="absolute bottom-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
                        title="Remove"
                >
                        <MdClose className="w-4 h-4" />
                </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Drag items to reorder • First item will be used as featured image
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : null })}
              className="input-modern"
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
              className="input-modern"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Scheduled Publish Date
            <span className="text-xs font-normal text-gray-500 ml-2">(Optional - Leave empty to publish immediately)</span>
          </label>
          <div className="relative">
          <input
            type="datetime-local"
              value={convertToDatetimeLocal(formData.scheduled_publish_date) || ''}
            onChange={(e) => setFormData({ ...formData, scheduled_publish_date: e.target.value || null })}
              placeholder="Select date and time to schedule publication"
              className="input-modern pr-10"
          />
            {formData.scheduled_publish_date && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, scheduled_publish_date: null })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1 rounded"
                title="Clear scheduled date"
              >
                <MdClose className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.scheduled_publish_date 
              ? 'Article will be published automatically at the selected date and time.'
              : 'If left empty, the article will be published immediately when you change status to "Published".'}
          </p>
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

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/articles')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              isEdit ? 'Update Article' : 'Create Article'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


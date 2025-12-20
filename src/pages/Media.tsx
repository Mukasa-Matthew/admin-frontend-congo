import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../services/media';
import { MdCloudUpload, MdDelete, MdImage, MdVideoLibrary, MdClose } from 'react-icons/md';

// Define MediaItem type locally to avoid module resolution issues
interface MediaItem {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

export default function Media() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => mediaService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setUploadError('Please select an image or video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File size must be less than 100MB');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      await mediaService.upload(file);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Media</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 transition">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <MdCloudUpload className="w-16 h-16 text-gray-400 mb-4" />
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
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {uploadError}
          </div>
        )}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : media && media.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
            >
              <div className="relative aspect-video bg-gray-100">
                {isImage(item.mime_type) ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedMedia(item)}
                  />
                ) : isVideo(item.mime_type) ? (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gray-900 cursor-pointer"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <MdVideoLibrary className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MdImage className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                  title="Delete"
                >
                  <MdDelete className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-gray-900 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(item.size)} • {formatDate(item.created_at)}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    // You could add a toast notification here
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 mt-2"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MdImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No media files uploaded yet</p>
          <p className="text-sm text-gray-500 mt-2">Upload your first image or video to get started</p>
        </div>
      )}

      {/* Media Preview Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedMedia.filename}</h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedMedia.size)} • {formatDate(selectedMedia.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {isImage(selectedMedia.mime_type) ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : isVideo(selectedMedia.mime_type) ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full h-auto rounded-lg"
                />
              ) : null}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={selectedMedia.url}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMedia.url);
                      // You could add a toast notification here
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


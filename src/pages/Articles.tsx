import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import { 
  MdAdd as Plus, 
  MdEdit as Edit, 
  MdDelete as Trash2, 
  MdSearch as Search, 
  MdCheckBox, 
  MdCheckBoxOutlineBlank,
  MdFilterList,
  MdVisibility,
  MdSchedule
} from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function Articles() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['articles', page, search, statusFilter],
    queryFn: () => articlesService.getAll({ page, limit: 10, search, status: statusFilter || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: articlesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setSelectedArticles([]);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => articlesService.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setSelectedArticles([]);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[], status: string }) => {
      await Promise.all(ids.map(id => articlesService.update(id, { status: status as any })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setSelectedArticles([]);
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSelectArticle = (id: number) => {
    setSelectedArticles(prev => 
      prev.includes(id) 
        ? prev.filter(articleId => articleId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === data?.articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(data?.articles.map(a => a.id) || []);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedArticles.length} article(s)?`)) {
      bulkDeleteMutation.mutate(selectedArticles);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    if (confirm(`Change status of ${selectedArticles.length} article(s) to ${status}?`)) {
      bulkStatusMutation.mutate({ ids: selectedArticles, status });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Articles</h1>
          <p className="text-gray-600">Manage and organize your news articles</p>
        </div>
        <Link
          to="/articles/new"
          className="btn-primary inline-flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Article
        </Link>
      </div>

      {/* Modern Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles by title or excerpt..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-modern pl-12"
            />
          </div>
          <div className="relative">
            <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input-modern pl-12 pr-10 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedArticles.length > 0 && (
        <div className="card bg-gradient-to-r from-primary-50 to-primary-100/50 border-primary-200 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-primary-900">
                {selectedArticles.length} article(s) selected
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkStatusChange('published')}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkStatusChange('draft')}
                  className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Draft
                </button>
                <button
                  onClick={() => handleBulkStatusChange('archived')}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Archive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedArticles([])}
              className="text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Modern Articles Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                  <button 
                  onClick={handleSelectAll} 
                  className="text-primary-600 hover:text-primary-800 transition-colors"
                  title="Select all"
                >
                    {selectedArticles.length === data?.articles.length && data?.articles.length > 0 ? (
                      <MdCheckBox className="w-5 h-5" />
                    ) : (
                      <MdCheckBoxOutlineBlank className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data?.articles.map((article) => (
                <tr 
                  key={article.id} 
                  className={`transition-all duration-200 ${
                    selectedArticles.includes(article.id) 
                      ? 'bg-primary-50/50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSelectArticle(article.id)}
                      className="text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      {selectedArticles.includes(article.id) ? (
                        <MdCheckBox className="w-5 h-5" />
                      ) : (
                        <MdCheckBoxOutlineBlank className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{article.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{article.excerpt || 'No excerpt'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {article.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge border ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-700">
                      <MdVisibility className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{article.views}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MdSchedule className="w-4 h-4" />
                      <span>{new Date(article.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/articles/${article.id}`}
                        className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modern Pagination */}
        {data && data.total > 10 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 font-medium">
              Showing <span className="font-semibold">{(page - 1) * 10 + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(page * 10, data.total)}</span> of{' '}
              <span className="font-semibold">{data.total}</span> articles
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= data.total}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

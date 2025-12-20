import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import { MdAdd as Plus, MdEdit as Edit, MdDelete as Trash2, MdSearch as Search, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function Articles() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [_showBulkActions, setShowBulkActions] = useState(false);
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
      setShowBulkActions(false);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[], status: string }) => {
      await Promise.all(ids.map(id => articlesService.update(id, { status: status as any })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      setSelectedArticles([]);
      setShowBulkActions(false);
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
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-2">Manage your news articles</p>
        </div>
        <Link
          to="/articles/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedArticles.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-primary-900">
              {selectedArticles.length} article(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusChange('published')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition"
              >
                Draft
              </button>
              <button
                onClick={() => handleBulkStatusChange('archived')}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
              >
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedArticles([]);
              setShowBulkActions(false);
            }}
            className="text-sm text-primary-700 hover:text-primary-900"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <button onClick={handleSelectAll} className="text-primary-600 hover:text-primary-800">
                    {selectedArticles.length === data?.articles.length && data?.articles.length > 0 ? (
                      <MdCheckBox className="w-5 h-5" />
                    ) : (
                      <MdCheckBoxOutlineBlank className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.articles.map((article) => (
                <tr key={article.id} className={`hover:bg-gray-50 ${selectedArticles.includes(article.id) ? 'bg-primary-50' : ''}`}>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSelectArticle(article.id)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      {selectedArticles.includes(article.id) ? (
                        <MdCheckBox className="w-5 h-5" />
                      ) : (
                        <MdCheckBoxOutlineBlank className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-md">{article.excerpt}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.category_name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        article.status
                      )}`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{article.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <Link
                      to={`/articles/${article.id}`}
                      className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > 10 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.total)} of {data.total} articles
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 10 >= data.total}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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


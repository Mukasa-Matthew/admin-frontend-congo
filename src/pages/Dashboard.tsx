import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboard';
import { 
  MdArticle as FileText,
  MdFolder as FolderTree,
  MdLabel as Tag,
  MdComment as MessageSquare,
  MdVisibility as Eye,
  MdEmail as Mail,
  MdCheckCircle as CheckCircle,
  MdSchedule as Clock,
  MdTrendingUp,
  MdAccessTime
} from 'react-icons/md';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    retry: false,
  });

  const statCards = [
    {
      title: 'Total Articles',
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Published',
      value: stats?.publishedArticles || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Drafts',
      value: stats?.draftArticles || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      color: 'bg-purple-500',
    },
    {
      title: 'Tags',
      value: stats?.totalTags || 0,
      icon: Tag,
      color: 'bg-pink-500',
    },
    {
      title: 'Comments',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'bg-indigo-500',
    },
    {
      title: 'Pending Comments',
      value: stats?.pendingComments || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'bg-teal-500',
    },
    {
      title: 'Newsletter Subscribers',
      value: stats?.newsletterSubscribers || 0,
      icon: Mail,
      color: 'bg-red-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load dashboard stats</p>
          <p className="text-gray-600 text-sm">Make sure the backend server is running</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to Congo News Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trending Articles & Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Trending Articles */}
        {stats?.trendingArticles && stats.trendingArticles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdTrendingUp className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Trending Articles</h2>
            </div>
            <div className="space-y-3">
              {stats.trendingArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views || 0} views</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {stats?.recentArticles && stats.recentArticles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MdAccessTime className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Recent Articles</h2>
            </div>
            <div className="space-y-3">
              {stats.recentArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' :
                        article.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status}
                      </span>
                      {article.category_name && (
                        <span className="text-gray-500">{article.category_name}</span>
                      )}
                      <span className="text-gray-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboard';
import { profileService } from '../services/profile';
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
  MdAccessTime,
  MdArrowUpward,
  MdArrowDownward
} from 'react-icons/md';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    retry: 1,
  });

  const displayName = profile?.username || profile?.email?.split('@')[0] || 'Admin';

  const statCards = [
    {
      title: 'Total Articles',
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Published',
      value: stats?.publishedArticles || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Drafts',
      value: stats?.draftArticles || 0,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      trend: '-3%',
      trendUp: false,
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Tags',
      value: stats?.totalTags || 0,
      icon: Tag,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Comments',
      value: stats?.totalComments || 0,
      icon: MessageSquare,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      trend: '+22%',
      trendUp: true,
    },
    {
      title: 'Pending Comments',
      value: stats?.pendingComments || 0,
      icon: MessageSquare,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: '-10%',
      trendUp: false,
    },
    {
      title: 'Total Views',
      value: stats?.totalViews?.toLocaleString() || '0',
      icon: Eye,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      trend: '+45%',
      trendUp: true,
    },
    {
      title: 'Newsletter Subscribers',
      value: stats?.newsletterSubscribers || 0,
      icon: Mail,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: '+18%',
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center card max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 text-sm">Make sure the backend server is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-lg">
          Welcome back, 👋 <span className="font-semibold text-gray-900">{displayName}</span>! Here's what's happening with your content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="stat-card animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  stat.trendUp 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.trendUp ? (
                    <MdArrowUpward className="w-3 h-3" />
                  ) : (
                    <MdArrowDownward className="w-3 h-3" />
                  )}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color} opacity-20`}></div>
            </div>
          );
        })}
      </div>

      {/* Trending & Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Articles */}
        {stats?.trendingArticles && stats.trendingArticles.length > 0 && (
          <div className="card animate-scale-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <MdTrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Trending Articles</h2>
                <p className="text-sm text-gray-500">Most viewed this week</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.trendingArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-primary-100"
                >
                  <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-110 transition-transform`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{article.views || 0}</span>
                        <span>views</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Articles */}
        {stats?.recentArticles && stats.recentArticles.length > 0 && (
          <div className="card animate-scale-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <MdAccessTime className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recent Articles</h2>
                <p className="text-sm text-gray-500">Latest content updates</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.recentArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/articles/${article.id}`}
                  className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group border border-transparent hover:border-primary-100"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <span className={`badge ${
                        article.status === 'published' ? 'bg-green-100 text-green-800' :
                        article.status === 'draft' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status}
                      </span>
                      {article.category_name && (
                        <span className="text-sm text-gray-500">{article.category_name}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
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


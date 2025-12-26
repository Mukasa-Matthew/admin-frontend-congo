import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdDashboard as LayoutDashboard,
  MdArticle as FileText,
  MdFolder as FolderTree,
  MdLabel as Tag,
  MdComment as MessageSquare,
  MdEmail as Mail,
  MdImage as ImageIcon,
  MdLogout as LogOut,
  MdMenu as Menu,
  MdClose as X,
  MdNotifications as Notifications,
  MdSettings as Settings,
  MdPublic as Public
} from 'react-icons/md';
import { useState } from 'react';
import { authService } from '../services/auth';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profile';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Articles', href: '/articles', icon: FileText },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Tags', href: '/tags', icon: Tag },
  { name: 'Media', href: '/media', icon: ImageIcon },
  { name: 'Comments', href: '/comments', icon: MessageSquare },
  { name: 'Newsletter', href: '/newsletter', icon: Mail },
  { name: 'Profile', href: '/settings', icon: Settings },
  { name: 'Site Settings', href: '/site-settings', icon: Public },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    retry: 1,
  });

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Get user display name (username or email)
  const displayName = profile?.username || profile?.email?.split('@')[0] || 'Admin User';
  const displayEmail = profile?.email || 'admin@news.com';
  const avatarInitial = (profile?.username?.[0] || profile?.email?.[0] || 'A').toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl shadow-2xl border-r border-white/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100/50 bg-gradient-to-r from-primary-50/50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CN</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gradient">Congo News</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-link group ${
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section & Logout */}
          <div className="p-4 border-t border-gray-100/50 bg-gradient-to-t from-gray-50/50 to-transparent">
            <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {avatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="nav-link nav-link-inactive w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Modern Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100/50">
          <div className="flex items-center justify-between h-20 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb or Page Title */}
            <div className="flex-1 ml-4 lg:ml-0">
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {location.pathname === '/' ? 'Dashboard' : 
                 location.pathname.split('/').pop()?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Admin'}
              </h2>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Notifications className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/settings"
                className={`p-2 rounded-xl transition-all duration-200 ${
                  location.pathname === '/settings'
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                {avatarInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page content with smooth animation */}
        <main className="p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

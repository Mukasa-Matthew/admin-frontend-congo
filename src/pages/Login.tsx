import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { MdLogin as LogIn, MdEmail, MdAccountCircle, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function Login() {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Determine if it's an email or username
      const isEmail = loginIdentifier.includes('@');
      const credentials = isEmail 
        ? { email: loginIdentifier, password }
        : { username: loginIdentifier, password };
      
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username/email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/85 to-primary-900/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300 ring-4 ring-primary-500/20">
            <span className="text-white font-bold text-3xl">📰</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Welcome Back
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Login Card with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-2 border-red-400/50 text-red-100 px-4 py-3 rounded-xl flex items-center space-x-2 animate-fade-in">
                <span className="text-xl">⚠️</span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Username/Email Input */}
            <div>
              <label htmlFor="loginIdentifier" className="block text-sm font-semibold text-white mb-2">
                Username or Email
              </label>
              <div className="relative">
                {loginIdentifier.includes('@') ? (
                  <MdEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 z-10" />
                ) : (
                  <MdAccountCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 z-10" />
                )}
                <input
                  id="loginIdentifier"
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all duration-200"
                  placeholder="username or email@example.com"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                You can login with either your username or email address
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5 z-10" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors z-10"
                >
                  {showPassword ? (
                    <MdVisibilityOff className="w-5 h-5" />
                  ) : (
                    <MdVisibility className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-gray-300">
              🔒 Secure Admin Access
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <span>Protected by encryption</span>
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

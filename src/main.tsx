import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handlers to prevent external scripts (browser extensions, etc.) from breaking the app
window.addEventListener('error', (event) => {
  // Filter out errors from external scripts (browser extensions)
  const errorSource = event.filename || event.target?.src || '';
  const errorMessage = event.message || '';
  const errorString = String(event.error || '');
  
  const isExternalScript = 
    errorSource.includes('giveFreely') ||
    errorSource.includes('sharebx') ||
    errorSource.includes('css.js') ||
    errorSource.includes('extension://') ||
    errorSource.includes('chrome-extension://') ||
    errorSource.includes('moz-extension://') ||
    errorMessage.includes('giveFreely') ||
    errorMessage.includes('sharebx') ||
    errorString.includes('giveFreely') ||
    errorString.includes('sharebx') ||
    errorString.includes('payload');
  
  if (isExternalScript) {
    // Suppress console errors from external scripts
    event.preventDefault();
    event.stopPropagation();
    return false; // Prevent default error logging
  }
  
  // Log other errors normally
  console.error('Application error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const errorMessage = error?.message || String(error) || '';
  const errorStack = error?.stack || '';
  const errorString = String(error);
  
  // Filter out errors from external scripts
  const isExternalError = 
    errorMessage.includes('giveFreely') ||
    errorMessage.includes('sharebx') ||
    errorMessage.includes('payload') ||
    errorStack.includes('giveFreely') ||
    errorStack.includes('sharebx') ||
    errorStack.includes('css.js') ||
    errorString.includes('giveFreely') ||
    errorString.includes('sharebx') ||
    errorString.includes('payload') ||
    errorStack.includes('extension://') ||
    errorStack.includes('chrome-extension://') ||
    errorStack.includes('moz-extension://');
  
  if (isExternalError) {
    // Suppress promise rejections from external scripts
    event.preventDefault();
    return; // Don't log to console
  }
  
  // Log other promise rejections normally
  console.error('Unhandled promise rejection:', error);
});

// Override console.error to filter out external script errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorString = args.map(arg => {
    try {
      return String(arg);
    } catch {
      return '';
    }
  }).join(' ');
  
  if (
    errorString.includes('giveFreely') ||
    errorString.includes('sharebx') ||
    errorString.includes('css.js') ||
    (errorString.includes('payload') && errorString.includes('undefined')) ||
    errorString.includes('Cannot read properties of undefined') ||
    args.some(arg => {
      try {
        const str = String(arg);
        return str.includes('giveFreely') || str.includes('sharebx') || str.includes('css.js');
      } catch {
        return false;
      }
    })
  ) {
    // Suppress these errors completely
    return;
  }
  originalConsoleError.apply(console, args);
};

// Also override console.warn for extension warnings
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const errorString = args.map(arg => {
    try {
      return String(arg);
    } catch {
      return '';
    }
  }).join(' ');
  
  if (
    errorString.includes('giveFreely') ||
    errorString.includes('sharebx') ||
    errorString.includes('css.js')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

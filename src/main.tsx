import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handlers for debugging
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error Handler:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  // Don't prevent default - we want to see what's happening
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    reason: event.reason,
    promise: event.promise
  });
  // Prevent default to avoid console errors, but log it
  event.preventDefault();
});

// Track page reloads
let reloadCount = 0;
const originalLocation = window.location.href;
window.addEventListener('beforeunload', () => {
  reloadCount++;
  console.warn('⚠️ Page is about to reload!', {
    count: reloadCount,
    currentUrl: window.location.href,
    originalUrl: originalLocation,
    timestamp: new Date().toISOString()
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

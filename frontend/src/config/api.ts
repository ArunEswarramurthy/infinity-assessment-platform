// Use HTTPS in production, HTTP only for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://localhost:5000' : 'http://localhost:5000');

// Security headers for API requests
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
};

export { API_BASE_URL };
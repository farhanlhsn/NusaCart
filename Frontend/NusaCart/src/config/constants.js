// Base URL configuration
// Prioritize environment variable, fallback to localhost for development
export const BASE_URL = import.meta.env.VITE_API_URL || 
                        (window.location.hostname === 'localhost' ? 'http://localhost:6060' : 
                         `http://${window.location.hostname}:6060`);

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${BASE_URL}${endpoint}`;
}; 
// Configuration for API endpoints
interface Config {
  apiUrl: string;
}

// In a production build, window.location.hostname will be the actual host
// When running in Docker, this will be 'localhost' or the actual Docker host
// We'll use this to determine the backend URL
const getApiUrl = (): string => {
  // If API_URL is explicitly defined as an env var, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // If running in Docker development mode, always use localhost:3000
  if (process.env.REACT_APP_IN_DOCKER === 'true') {
    return 'http://localhost:3000';
  }

  // If window is available (browser environment)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If running on localhost in development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Always use direct backend connection for development
      return 'http://localhost:3000';
    }
    
    // For production deployments with nginx proxy
    return '/api';
  }

  // Default fallback for development
  return 'http://localhost:3000';
};

const config: Config = {
  apiUrl: getApiUrl()
};

console.log('Frontend API URL configured as:', config.apiUrl);
console.log('Environment - IN_DOCKER:', process.env.REACT_APP_IN_DOCKER);
console.log('Environment - API_URL:', process.env.REACT_APP_API_URL);

export default config; 
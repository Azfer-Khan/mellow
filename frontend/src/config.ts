// Configuration for API endpoints
interface Config {
  apiUrl: string;
}

// In a production build, window.location.hostname will be the actual host
// When running in Docker, this will be 'localhost' or the actual Docker host
// We'll use this to determine the backend URL
const getApiUrl = (): string => {
  // If REACT_APP_IN_DOCKER env var is set, use the Docker service name
  if (process.env.REACT_APP_IN_DOCKER === 'true') {
    return 'http://node-backend:3000';
  }

  // If API_URL is explicitly defined as an env var, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // If window is available (browser environment)
  if (typeof window !== 'undefined') {
    // If running on localhost, connect to local backend
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3000';
    }
    // Otherwise, assume the backend is on the same host but on port 3000
    return `http://${window.location.hostname}:3000`;
  }

  // Default fallback
  return 'http://localhost:3000';
};

const config: Config = {
  apiUrl: getApiUrl()
};

export default config; 
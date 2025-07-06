import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
  origin: [
    'http://localhost:3000',     // React dev server
    'http://localhost:3001',     // Alternative React dev server
    'http://localhost:80',       // Docker frontend on port 80
    'http://localhost',          // Docker frontend without port
    'http://frontend',           // Docker service name
    'http://frontend:3000',      // Docker frontend service
    'http://frontend:80',        // Docker frontend on port 80
    'http://127.0.0.1:3000',     // Local IP
    'http://127.0.0.1:80',       // Local IP on port 80
    'http://127.0.0.1',          // Local IP without port
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}; 
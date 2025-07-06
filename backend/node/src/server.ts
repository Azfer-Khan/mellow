import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from './config/environment';
import { corsConfig } from './config/cors';
import { initializeDatabase, closeDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const port = config.port;

// Configure CORS
app.use(cors(corsConfig));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Mount all routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize application
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Start the server
    app.listen(port, () => {
      logger.info(`Backend server is listening at http://localhost:${port}`);
      logger.info(`Using Python AI service at: ${config.pythonAiUrl}`);
      logger.info(`Connected to PostgreSQL database at: ${config.database.host}:${config.database.port}/${config.database.database}`);
      logger.info('\n=== Available Endpoints ===');
      logger.info('POST /auth/register - Register new user');
      logger.info('POST /auth/login - User login');
      logger.info('GET /auth/me - Get current user info');
      logger.info('GET /users - Get all users (admin)');
      logger.info('POST /users - Create user (admin)');
      logger.info('GET /users/:id - Get user by ID');
      logger.info('PUT /users/:id - Update user');
      logger.info('DELETE /users/:id - Deactivate user');
      logger.info('POST /chat - Send chat message');
      logger.info('GET /chat/conversations - Get all conversations (admin)');
      logger.info('GET /chat/conversations/my - Get user conversations');
      logger.info('GET /health - Health check');
      logger.info('========================');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`\nReceived ${signal}. Shutting down gracefully...`);
  try {
    await closeDatabase();
    logger.info('Database connections closed.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start the server
startServer();

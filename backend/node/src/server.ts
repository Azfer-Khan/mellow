import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { Pool } from 'pg';
import cors from 'cors';
import { 
  UserService, 
  AuthRequest, 
  CreateUserRequest, 
  LoginRequest,
  authenticateToken, 
  requirePermission, 
  requireAdmin 
} from './userService';

const app = express();
const port = 3000;

// Python AI service URL from environment variable or default
const pythonAiUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000';

// PostgreSQL configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mellow_db',
  user: process.env.DB_USER || 'mellow_user',
  password: process.env.DB_PASSWORD || 'mellow_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
};

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://frontend', 
    'http://localhost:80', 
    'http://frontend:80'
  ], // Allow React dev server, Electron, and Docker frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Initialize UserService
const userService = new UserService(pool);

// Test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
    
    // Test query to ensure tables exist
    const conversationResult = await client.query('SELECT COUNT(*) FROM conversations');
    console.log(`Found ${conversationResult.rows[0].count} existing conversations in database`);
    
    const userResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Found ${userResult.rows[0].count} existing users in database`);
    
    client.release();
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    process.exit(1);
  }
})();

// ==================== USER MANAGEMENT ENDPOINTS ====================

// POST /auth/register - Register a new user
app.post('/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserRequest = req.body;
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Password validation
    if (userData.password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const user = await userService.createUser(userData);
    const token = userService.generateToken(user);

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token 
    });
  } catch (error: any) {
    console.error('Error in /auth/register:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /auth/login - User login
app.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData: LoginRequest = req.body;
    
    if (!loginData.username || !loginData.password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const { user, token } = await userService.authenticateUser(loginData);

    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        last_login: user.last_login
      },
      token 
    });
  } catch (error: any) {
    console.error('Error in /auth/login:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// GET /auth/me - Get current user info
app.get('/auth/me', authenticateToken(userService), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const permissions = await userService.getUserPermissions(req.user!.id);
    
    res.json({
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        first_name: req.user!.first_name,
        last_name: req.user!.last_name,
        role: req.user!.role,
        is_active: req.user!.is_active,
        is_verified: req.user!.is_verified,
        last_login: req.user!.last_login,
        created_at: req.user!.created_at
      },
      permissions
    });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// GET /users - Get all users (admin only)
app.get('/users', 
  authenticateToken(userService), 
  requirePermission('users.read', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const users = await userService.getAllUsers(limit, offset);
      res.json({ users });
    } catch (error) {
      console.error('Error in /users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// POST /users - Create user (admin only)
app.post('/users', 
  authenticateToken(userService), 
  requirePermission('users.create', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      const user = await userService.createUser(userData, req.user!.id);
      
      res.status(201).json({ 
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Error in POST /users:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// GET /users/:id - Get user by ID
app.get('/users/:id', 
  authenticateToken(userService), 
  requirePermission('users.read', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const permissions = await userService.getUserPermissions(userId);
      
      res.json({ 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          is_verified: user.is_verified,
          last_login: user.last_login,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        permissions 
      });
    } catch (error) {
      console.error('Error in GET /users/:id:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

// PUT /users/:id - Update user
app.put('/users/:id', 
  authenticateToken(userService), 
  requirePermission('users.update', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const updates: Partial<CreateUserRequest> = req.body;
      
      const user = await userService.updateUser(userId, updates, req.user!.id);
      
      res.json({ 
        message: 'User updated successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          is_verified: user.is_verified,
          updated_at: user.updated_at
        }
      });
    } catch (error: any) {
      console.error('Error in PUT /users/:id:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

// DELETE /users/:id - Deactivate user
app.delete('/users/:id', 
  authenticateToken(userService), 
  requirePermission('users.delete', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent self-deletion
      if (userId === req.user!.id) {
        res.status(400).json({ error: 'Cannot deactivate your own account' });
        return;
      }
      
      const success = await userService.deactivateUser(userId, req.user!.id);
      
      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error in DELETE /users/:id:', error);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  }
);

// ==================== EXISTING CHAT ENDPOINTS ====================

// GET /conversations endpoint to retrieve chat history
app.get('/conversations', 
  authenticateToken(userService), 
  requirePermission('chat.read', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT c.id, c.user_message, c.ai_response, c.timestamp, c.user_id, u.username 
         FROM conversations c 
         LEFT JOIN users u ON c.user_id = u.id 
         ORDER BY c.timestamp DESC LIMIT 50`
      );
      client.release();
      
      res.json({ conversations: result.rows });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }
);

// POST /chat endpoint with explicit types
app.post('/chat', 
  authenticateToken(userService), 
  requirePermission('chat.create', userService),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const client = await pool.connect();
    
    try {
      const { message } = req.body;
      if (!message) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      // Call the Python microservice to get an AI response
      const pythonResponse = await axios.post(`${pythonAiUrl}/generate-response`, { message });
      const aiResponse = pythonResponse.data.response;

      // Log the conversation into PostgreSQL with user association
      const insertResult = await client.query(
        'INSERT INTO conversations (user_message, ai_response, user_id) VALUES ($1, $2, $3) RETURNING id, timestamp',
        [message, aiResponse, req.user!.id]
      );

      res.json({ 
        response: aiResponse,
        conversation_id: insertResult.rows[0].id,
        timestamp: insertResult.rows[0].timestamp,
        user_id: req.user!.id
      });
    } catch (error) {
      console.error('Error in /chat endpoint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client.release();
    }
  }
);

// Health check endpoint
app.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is listening at http://localhost:${port}`);
  console.log(`Using Python AI service at: ${pythonAiUrl}`);
  console.log(`Connected to PostgreSQL database at: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log('\n=== Available User Management Endpoints ===');
  console.log('POST /auth/register - Register new user');
  console.log('POST /auth/login - User login');
  console.log('GET /auth/me - Get current user info');
  console.log('GET /users - Get all users (admin)');
  console.log('POST /users - Create user (admin)');
  console.log('GET /users/:id - Get user by ID');
  console.log('PUT /users/:id - Update user');
  console.log('DELETE /users/:id - Deactivate user');
  console.log('==========================================');
});

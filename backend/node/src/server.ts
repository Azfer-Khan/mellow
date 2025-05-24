import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { Pool } from 'pg';
import cors from 'cors';

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
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize PostgreSQL connection pool
const pool = new Pool(dbConfig);

// Test database connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
    
    // Test query to ensure table exists
    const result = await client.query('SELECT COUNT(*) FROM conversations');
    console.log(`Found ${result.rows[0].count} existing conversations in database`);
    
    client.release();
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    process.exit(1);
  }
})();

// GET /conversations endpoint to retrieve chat history
app.get('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, user_message, ai_response, timestamp FROM conversations ORDER BY timestamp DESC LIMIT 50'
    );
    client.release();
    
    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /chat endpoint with explicit types
app.post('/chat', async (req: Request, res: Response): Promise<void> => {
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

    // Log the conversation into PostgreSQL
    const insertResult = await client.query(
      'INSERT INTO conversations (user_message, ai_response) VALUES ($1, $2) RETURNING id, timestamp',
      [message, aiResponse]
    );

    res.json({ 
      response: aiResponse,
      conversation_id: insertResult.rows[0].id,
      timestamp: insertResult.rows[0].timestamp
    });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

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
});

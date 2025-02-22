import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import cors from 'cors';

const app = express();
const port = 3000;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both React dev server and Electron
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize SQLite database (stored in 'chat.db')
// Using "any" to bypass type issues temporarily.
let db: any;

(async () => {
  db = await open({
    filename: './chat.db',
    driver: sqlite3.Database
  }) as any; // Cast to any to bypass TS2740 error

  // Create the conversations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// POST /chat endpoint with explicit types
app.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    // Call the Python microservice to get an AI response
    const pythonResponse = await axios.post('http://localhost:8000/generate-response', { message });
    const aiResponse = pythonResponse.data.response;

    // Log the conversation into SQLite
    await db.run(
      'INSERT INTO conversations (user_message, ai_response) VALUES (?, ?)',
      [message, aiResponse]
    );

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is listening at http://localhost:${port}`);
});

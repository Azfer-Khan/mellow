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

  // Create the mood_journal table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS mood_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood TEXT NOT NULL,
      note TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// POST /journal - Add a mood journal entry
app.post('/journal', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mood, note } = req.body;
    if (!mood) {
      res.status(400).json({ error: 'Mood is required.' });
      return;
    }
    await db.run(
      'INSERT INTO mood_journal (mood, note) VALUES (?, ?)',
      [mood, note || null]
    );
    res.status(201).json({ message: 'Entry added.' });
  } catch (error) {
    console.error('Error in /journal POST:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /journal - Get all mood journal entries (latest first)
app.get('/journal', async (_req: Request, res: Response): Promise<void> => {
  try {
    const entries = await db.all('SELECT * FROM mood_journal ORDER BY timestamp DESC');
    res.json(entries);
  } catch (error) {
    console.error('Error in /journal GET:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /chat endpoint with explicit types
app.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    // Fetch last 5 conversation turns for memory
    const history = await db.all(
      'SELECT user_message, ai_response FROM conversations ORDER BY id DESC LIMIT 5'
    );
    const reversedHistory = history.reverse(); // oldest first

    // Call the Python microservice to get an AI response, passing history
    const pythonResponse = await axios.post('http://localhost:8000/generate-response', {
      message,
      history: reversedHistory
    });
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

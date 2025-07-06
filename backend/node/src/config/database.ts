import { Pool } from 'pg';
import { config } from './environment';

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(config.database);
  }
  return pool;
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    const dbPool = getPool();
    const client = await dbPool.connect();
    console.log('Connected to PostgreSQL database successfully');
    
    // Test query to ensure tables exist
    const conversationResult = await client.query('SELECT COUNT(*) FROM conversations');
    console.log(`Found ${conversationResult.rows[0].count} existing conversations in database`);
    
    const userResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`Found ${userResult.rows[0].count} existing users in database`);
    
    client.release();
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
}; 
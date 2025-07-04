import { getPool } from '../config/database';
import { logger } from '../utils/logger';

export class DatabaseService {
  private static instance: DatabaseService;
  
  private constructor() {}
  
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async query(text: string, params?: any[]): Promise<any> {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (query: (text: string, params?: any[]) => Promise<any>) => Promise<T>): Promise<T> {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const transactionQuery = (text: string, params?: any[]) => client.query(text, params);
      const result = await callback(transactionQuery);
      
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
} 
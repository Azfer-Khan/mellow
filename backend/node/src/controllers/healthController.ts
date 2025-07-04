import { Request, Response } from 'express';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

export class HealthController {
  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      const pool = getPool();
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      res.json({ 
        status: 'healthy', 
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  }
} 
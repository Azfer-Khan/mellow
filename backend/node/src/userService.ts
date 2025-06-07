import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Types for user management
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user' | 'moderator';
  is_active: boolean;
  is_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'user' | 'moderator';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

// JWT secret from environment or default (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class UserService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Hash password using bcrypt
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT token
  generateToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  // Verify JWT token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Create a new user
  async createUser(userData: CreateUserRequest, createdBy?: number): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      // Check if username or email already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [userData.username, userData.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Username or email already exists');
      }

      // Hash the password
      const passwordHash = await this.hashPassword(userData.password);

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, username, email, first_name, last_name, role, is_active, is_verified, created_at, updated_at`,
        [
          userData.username,
          userData.email,
          passwordHash,
          userData.first_name || null,
          userData.last_name || null,
          userData.role || 'user',
          createdBy || null
        ]
      );

      return result.rows[0] as User;
    } finally {
      client.release();
    }
  }

  // Authenticate user (login)
  async authenticateUser(loginData: LoginRequest): Promise<{ user: User; token: string }> {
    const client = await this.pool.connect();
    
    try {
      // Get user by username
      const result = await client.query(
        `SELECT id, username, email, password_hash, first_name, last_name, role, 
                is_active, is_verified, last_login, created_at, updated_at 
         FROM users WHERE username = $1 AND is_active = true`,
        [loginData.username]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid username or password');
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await this.verifyPassword(loginData.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid username or password');
      }

      // Update last login
      await client.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Remove password hash from user object
      delete user.password_hash;
      
      // Generate token
      const token = this.generateToken(user);

      return { user: user as User, token };
    } finally {
      client.release();
    }
  }

  // Get user by ID
  async getUserById(id: number): Promise<User | null> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id, username, email, first_name, last_name, role, 
                is_active, is_verified, last_login, created_at, updated_at 
         FROM users WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? result.rows[0] as User : null;
    } finally {
      client.release();
    }
  }

  // Get all users (admin only)
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id, username, email, first_name, last_name, role, 
                is_active, is_verified, last_login, created_at, updated_at 
         FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows as User[];
    } finally {
      client.release();
    }
  }

  // Update user
  async updateUser(id: number, updates: Partial<CreateUserRequest>, updatedBy?: number): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      // Build dynamic update query
      if (updates.username) {
        updateFields.push(`username = $${paramIndex++}`);
        updateValues.push(updates.username);
      }
      if (updates.email) {
        updateFields.push(`email = $${paramIndex++}`);
        updateValues.push(updates.email);
      }
      if (updates.password) {
        const hashedPassword = await this.hashPassword(updates.password);
        updateFields.push(`password_hash = $${paramIndex++}`);
        updateValues.push(hashedPassword);
      }
      if (updates.first_name !== undefined) {
        updateFields.push(`first_name = $${paramIndex++}`);
        updateValues.push(updates.first_name);
      }
      if (updates.last_name !== undefined) {
        updateFields.push(`last_name = $${paramIndex++}`);
        updateValues.push(updates.last_name);
      }
      if (updates.role) {
        updateFields.push(`role = $${paramIndex++}`);
        updateValues.push(updates.role);
      }
      if (updatedBy) {
        updateFields.push(`updated_by = $${paramIndex++}`);
        updateValues.push(updatedBy);
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(id);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING id, username, email, first_name, last_name, role, is_active, is_verified, last_login, created_at, updated_at
      `;

      const result = await client.query(query, updateValues);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0] as User;
    } finally {
      client.release();
    }
  }

  // Deactivate user (soft delete)
  async deactivateUser(id: number, deactivatedBy?: number): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE users SET is_active = false, updated_by = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [deactivatedBy || null, id]
      );

      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  // Check if user has permission
  async checkUserPermission(userId: number, permission: string): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT user_has_permission($1, $2) as has_permission',
        [userId, permission]
      );

      return result.rows[0].has_permission;
    } finally {
      client.release();
    }
  }

  // Get user permissions
  async getUserPermissions(userId: number): Promise<{ permission_name: string; permission_description: string }[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM get_user_permissions($1)',
        [userId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }
}

// Middleware to authenticate JWT token
export const authenticateToken = (userService: UserService) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    try {
      const decoded = userService.verifyToken(token);
      const user = await userService.getUserById(decoded.id);
      
      if (!user || !user.is_active) {
        res.status(401).json({ error: 'Invalid or inactive user' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
  };
};

// Middleware to check user permissions
export const requirePermission = (permission: string, userService: UserService) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const hasPermission = await userService.checkUserPermission(req.user.id, permission);
      
      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
      return;
    }
  };
};

// Middleware to check if user is admin
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}; 
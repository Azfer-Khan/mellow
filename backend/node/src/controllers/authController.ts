import { Response } from 'express';
import { AuthRequest, LoginRequest } from '../types/auth';
import { CreateUserRequest } from '../types/user';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class AuthController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async register(req: AuthRequest, res: Response): Promise<void> {
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

      const user = await this.userService.createUser(userData);
      const token = this.userService.generateToken(user);

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
      logger.error('Error in register:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      
      if (!loginData.username || !loginData.password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const { user, token } = await this.userService.authenticateUser(loginData);

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
      logger.error('Error in login:', error.message);
      res.status(401).json({ error: error.message });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await this.userService.getUserPermissions(req.user!.id);
      
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
      logger.error('Error in me:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }
} 
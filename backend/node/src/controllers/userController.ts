import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { CreateUserRequest } from '../types/user';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const users = await this.userService.getAllUsers(limit, offset);
      res.json({ users });
    } catch (error) {
      logger.error('Error in getAllUsers:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      
      // Validate required fields
      if (!userData.username || !userData.email || !userData.password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      const user = await this.userService.createUser(userData, req.user!.id);
      
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
      logger.error('Error in createUser:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const permissions = await this.userService.getUserPermissions(userId);
      
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
      logger.error('Error in getUserById:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const updates: Partial<CreateUserRequest> = req.body;
      
      const user = await this.userService.updateUser(userId, updates, req.user!.id);
      
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
      logger.error('Error in updateUser:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  async deactivateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent self-deletion
      if (userId === req.user!.id) {
        res.status(400).json({ error: 'Cannot deactivate your own account' });
        return;
      }
      
      const success = await this.userService.deactivateUser(userId, req.user!.id);
      
      if (!success) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      logger.error('Error in deactivateUser:', error);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  }
} 
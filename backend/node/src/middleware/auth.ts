import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';
import { UserService } from '../services/userService';

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
        res.status(403).json({ error: 'User not found or inactive' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
  };
};

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
      res.status(500).json({ error: 'Error checking permissions' });
      return;
    }
  };
};

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
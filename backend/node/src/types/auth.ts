import { Request } from 'express';
import { User } from './user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface TokenPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    role: string;
    last_login?: Date;
  };
  token: string;
} 
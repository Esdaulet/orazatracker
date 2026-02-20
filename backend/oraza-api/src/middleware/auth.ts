import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'oraza-secret-key-2024';

export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '';

export interface AuthRequest extends Request {
  userId?: string;
  userPhone?: string;
  isAdmin?: boolean;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Нет токена авторизации' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phone: string; isAdmin: boolean };
    req.userId = decoded.userId;
    req.userPhone = decoded.phone;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch {
    res.status(401).json({ error: 'Неверный или просроченный токен' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.isAdmin) {
    res.status(403).json({ error: 'Нет доступа' });
    return;
  }
  next();
};

export const generateToken = (userId: string, phone: string, displayName: string, role: string): string => {
  const isAdmin = role === 'admin';
  return jwt.sign({ userId, phone, displayName, role, isAdmin }, JWT_SECRET, { expiresIn: '365d' });
};

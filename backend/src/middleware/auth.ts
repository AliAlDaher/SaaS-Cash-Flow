import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    permissions?: any;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requirePermission = (moduleName: string, action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (user?.role === 'admin') return next();
    if (!user?.permissions?.[moduleName]?.[action]) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

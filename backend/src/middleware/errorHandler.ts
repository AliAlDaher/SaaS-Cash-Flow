import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("SERVER ERROR:", err);

  // Prisma Unique Constraint Error
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    const field = Array.isArray(target) ? target.join(', ') : (typeof target === 'string' ? target : 'field');
    return res.status(400).json({ error: `A record with this ${field} already exists.` });
  }

  // Prisma Record Not Found Error
  if (err.code === 'P2025') {
    return res.status(404).json({ error: "The requested record was not found." });
  }

  // Validation / Casting errors
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: "Invalid input data provided." });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: "Invalid authentication token." });
  }

  // Default Fallback
  const status = err.status || 500;
  const message = status === 500 ? "Something went wrong. Please try again later." : err.message;
  
  res.status(status).json({ error: message });
};

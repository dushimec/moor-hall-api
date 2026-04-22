import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import ApiError from '../utils/apiError';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(ApiError.unauthorized('No token provided'));
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(ApiError.unauthorized('Invalid token format'));
  }

  const token = parts[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return next(ApiError.internal('JWT secret not configured'));
  }

  try {
    const payload = verifyToken(token, jwtSecret);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName || '',
      status: payload.status || 'ACTIVE',
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const jwtSecret = process.env.JWT_SECRET;

  if (!authHeader || !jwtSecret) {
    return next();
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];

  try {
    const payload = verifyToken(token, jwtSecret);

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName || '',
      status: payload.status || 'ACTIVE',
    };
  } catch {
    // Ignore token errors for optional auth
  }

  next();
};

export const protect = authenticate;
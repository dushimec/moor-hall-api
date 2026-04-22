import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import apiResponse from '../utils/apiResponse';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errors?: unknown[];
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    error = err;
  } else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
  } else if (err.name === 'PrismaClientInitializationError') {
    statusCode = 503;
    message = 'Database service unavailable';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  const response = apiResponse.badRequest(message, error.errors);

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(apiResponse.notFound(`Route ${req.originalUrl} not found`));
};
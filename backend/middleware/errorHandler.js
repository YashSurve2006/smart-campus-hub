import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  const status = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const message =
    err instanceof AppError ? err.message : err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production' && !(err instanceof AppError)) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
}

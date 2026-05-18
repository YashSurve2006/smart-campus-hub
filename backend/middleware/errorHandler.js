import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  const status = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const message = err instanceof AppError ? err.message : err.message || 'Internal server error';

  console.error('[errorHandler] %s %s %s', req.method, req.originalUrl, message);
  console.error('  status:', status);
  console.error('  params:', req.params);
  console.error('  query:', req.query);
  console.error('  body:', req.body);
  if (!(err instanceof AppError) || process.env.NODE_ENV !== 'production') {
    console.error(err.stack || err);
  }

  res.status(status).json({
    success: false,
    message,
  });
}

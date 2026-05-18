import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const first = errors.array({ onlyFirstError: true })[0];
    console.warn('[validate] validation failed', {
      route: `${req.method} ${req.originalUrl}`,
      errors: errors.array(),
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next(new AppError(first?.msg || 'Validation failed', 400));
  }
  next();
}

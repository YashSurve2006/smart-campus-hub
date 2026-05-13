import { AppError } from '../utils/AppError.js';

export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return next(new AppError('Unauthorized', 401));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new AppError('Forbidden for this role', 403));
    }
    next();
  };
}

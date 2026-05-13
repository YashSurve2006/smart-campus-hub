import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  try {
    let token = req.cookies?.token;
    const header = req.headers.authorization;
    if (!token && header?.startsWith('Bearer ')) {
      token = header.slice(7);
    }
    if (!token) {
      throw new AppError('Authentication required', 401);
    }
    const decoded = verifyToken(token);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    next(new AppError('Invalid or expired session', 401));
  }
}

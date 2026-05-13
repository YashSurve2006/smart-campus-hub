import jwt from 'jsonwebtoken';
import { env } from './env.js';

const JWT_SECRET = env.jwt.secret;
const JWT_EXPIRES = env.jwt.expires;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

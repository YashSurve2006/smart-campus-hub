import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

const COOKIE_NAME = 'token';
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  const { token, user } = await authService.loginUser(req.body.email, req.body.password);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.status(201).json({ success: true, user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.loginUser(email, password);
  res.cookie(COOKIE_NAME, token, cookieOptions);
  res.json({ success: true, user, token });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user.id);
  res.json({ success: true, user: profile });
});

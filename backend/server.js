import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnv, env } from './utils/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { authenticate } from './middleware/auth.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import noticeRoutes from './routes/notices.js';
import attendanceRoutes from './routes/attendance.js';
import timetableRoutes from './routes/timetable.js';
import departmentRoutes from './routes/departments.js';
import classroomRoutes from './routes/classrooms.js';
import campusRoutes from './routes/campus.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import eventRoutes from './routes/events.js';
import assistantRoutes from './routes/assistant.js';
import fileRegistryRoutes from './routes/fileRegistry.js';
import resultRoutes from './routes/results.js';
import aiAnalyticsRoutes from './routes/aiAnalytics.js';
import assignmentRoutes from './routes/assignments.js';

validateEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
});

app.set('io', io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.user = null;
      return next();
    }
    const decoded = verifyToken(token);
    socket.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    socket.user = null;
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.user) {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
  }
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use(
  '/api/files/notices',
  authenticate,
  express.static(path.join(__dirname, 'uploads', 'notices'), { fallthrough: true })
);
app.use(
  '/api/files/events',
  express.static(path.join(__dirname, 'uploads', 'events'), { fallthrough: true })
);
app.use(
  '/api/files/avatars',
  express.static(path.join(__dirname, 'uploads', 'avatars'), { fallthrough: true })
);

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  return apiLimiter(req, res, next);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'smart-campus-hub-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/file-registry', fileRegistryRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/ai-analytics', aiAnalyticsRoutes);
app.use('/api/assignments', assignmentRoutes);

app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[process] Uncaught exception:', error);
});

httpServer.listen(env.port, () => {
  console.log(`Smart Campus Hub API listening on :${env.port}`);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'uploads', 'notices');
fs.mkdirSync(dir, { recursive: true });

function safeName(original) {
  const base = (original || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${base}`;
}

const allowedMime = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const uploadNoticeFiles = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
  }),
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new Error('Unsupported notice attachment type'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
});

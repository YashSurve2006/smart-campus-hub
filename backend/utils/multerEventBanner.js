import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'uploads', 'events');
fs.mkdirSync(dir, { recursive: true });

function safeName(original) {
  const base = (original || 'banner').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}`;
}

const imageMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const uploadEventBanner = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (imageMime.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WebP, or GIF images'));
  },
});

import multer from 'multer';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip'
]);

export const uploadAssignmentFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type for assignment. Allowed: PDF, DOC, DOCX, ZIP'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 8 // Max 8 files
  }
});

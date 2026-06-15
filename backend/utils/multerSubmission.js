import multer from 'multer';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip'
]);

export const uploadSubmissionFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type for submission. Allowed: PDF, DOC, DOCX, ZIP'));
    }
  },
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB per file
    files: 5 // Max 5 files
  }
});

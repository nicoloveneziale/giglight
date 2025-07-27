import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest, authMiddleware } from './auth';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: AuthRequest, file, cb) => {
    const userId = req.user?.id;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userId}-profile${fileExtension}`;
    cb(null, fileName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    message: 'Profile picture uploaded successfully!',
    fileUrl: fileUrl
  });
});

export default router;
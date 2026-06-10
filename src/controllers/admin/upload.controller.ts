import { Readable } from 'stream';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';
import { cloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';

const memoryStorage = multer.memoryStorage();

export const uploadImageMiddleware = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
}).single('image');

function uploadBufferToCloudinary(buffer: Buffer, folder: string, originalName: string) {
  return new Promise<{
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
  }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        context: { original_name: originalName },
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

export async function handleUploadImage(req: AdminRequest, res: Response) {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(500, 'Cloudinary is not configured on the server');
  }
  if (!req.file?.buffer) {
    throw new ApiError(400, 'No image file provided');
  }

  const folder = process.env.CLOUDINARY_FOLDER || 'tvexpress';
  const result = await uploadBufferToCloudinary(req.file.buffer, folder, req.file.originalname);

  res.json({
    success: true,
    message: 'Image uploaded to Cloudinary',
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    },
  });
}

export function handleUploadError(err: unknown, _req: Request, _res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'Image must be smaller than 10MB'));
    }
    return next(new ApiError(400, err.message));
  }
  if (err instanceof Error && err.message === 'Only image files are allowed') {
    return next(new ApiError(400, err.message));
  }
  next(err);
}

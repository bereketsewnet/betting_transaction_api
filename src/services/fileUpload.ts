import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

export interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

class FileUploadService {
  private s3: AWS.S3 | null = null;
  private config: UploadConfig;

  constructor() {
    this.config = {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '8388608'), // 8MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
      uploadPath: process.env.LOCAL_UPLOAD_PATH || './uploads',
    };

    // Initialize S3 if credentials are provided
    if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET) {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT,
      });
    }

    // Ensure upload directory exists for local storage
    if (!fs.existsSync(this.config.uploadPath)) {
      fs.mkdirSync(this.config.uploadPath, { recursive: true });
    }
  }

  /**
   * Configure multer for file uploads
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.config.uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.config.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PNG, JPG, and JPEG files are allowed.'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.config.maxFileSize,
      },
    });
  }

  /**
   * Upload file to S3 or local storage
   */
  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    if (this.s3) {
      try {
        return await this.uploadToS3(file);
      } catch (error) {
        console.warn('S3 upload failed, falling back to local storage:', error);
        return this.uploadLocally(file);
      }
    } else {
      return this.uploadLocally(file);
    }
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(file: Express.Multer.File): Promise<UploadResult> {
    const key = `uploads/${uuidv4()}${path.extname(file.originalname)}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET || 'betting-payment-manager-uploads',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const result = await this.s3!.upload(uploadParams).promise();
      
      return {
        filename: key,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: result.Location,
      };
    } catch (error) {
      throw new Error(`S3 upload failed: ${error}`);
    }
  }

  /**
   * Upload file locally
   */
  private async uploadLocally(file: Express.Multer.File): Promise<UploadResult> {
    // When using diskStorage, the file is already saved to disk
    // We just need to return the file info
    const filename = path.basename(file.path);
    const url = `${process.env.API_BASE_URL || 'http://localhost:3000'}/uploads/${filename}`;
    
    try {
      return {
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url,
      };
    } catch (error) {
      throw new Error(`Local upload failed: ${error}`);
    }
  }

  /**
   * Delete file from S3 or local storage
   */
  async deleteFile(filename: string): Promise<boolean> {
    if (this.s3) {
      return this.deleteFromS3(filename);
    } else {
      return this.deleteLocally(filename);
    }
  }

  /**
   * Delete file from S3
   */
  private async deleteFromS3(filename: string): Promise<boolean> {
    try {
      await this.s3!.deleteObject({
        Bucket: process.env.S3_BUCKET || 'betting-payment-manager-uploads',
        Key: filename,
      }).promise();
      
      return true;
    } catch (error) {
      console.error('S3 delete failed:', error);
      return false;
    }
  }

  /**
   * Delete file locally
   */
  private async deleteLocally(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.config.uploadPath, filename);
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Local delete failed:', error);
      return false;
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PNG, JPG, and JPEG files are allowed.',
      };
    }

    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${this.config.maxFileSize / 1024 / 1024}MB.`,
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();

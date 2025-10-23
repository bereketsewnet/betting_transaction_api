import { Request, Response } from 'express';
import { fileUploadService } from '../services/fileUpload';
import path from 'path';
import fs from 'fs';

export class UploadController {
  /**
   * Upload file endpoint
   */
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Validate file
      const validation = fileUploadService.validateFile(req.file);
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const uploadResult = await fileUploadService.uploadFile(req.file);

      res.json({
        message: 'File uploaded successfully',
        file: {
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          mimetype: uploadResult.mimetype,
          size: uploadResult.size,
          url: uploadResult.url,
        },
      });
    } catch (error) {
      console.error('Upload file error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  /**
   * Serve uploaded files (for local storage)
   */
  static async serveFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const uploadPath = process.env.LOCAL_UPLOAD_PATH || './uploads';
      const filePath = path.join(uploadPath, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.pdf': 'application/pdf',
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to serve file' });
        }
      });
    } catch (error) {
      console.error('Serve file error:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  }

  /**
   * Delete uploaded file
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;

      const success = await fileUploadService.deleteFile(filename);
      if (!success) {
        res.status(404).json({ error: 'File not found or could not be deleted' });
        return;
      }

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  /**
   * Get upload configuration
   */
  static async getUploadConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '8388608'),
        allowedTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        maxFileSizeMB: Math.round(parseInt(process.env.MAX_FILE_SIZE || '8388608') / 1024 / 1024),
      };

      res.json({ config });
    } catch (error) {
      console.error('Get upload config error:', error);
      res.status(500).json({ error: 'Failed to get upload configuration' });
    }
  }
}

import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import logger from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 15 // Maximum 15 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

const unsplashSearchSchema = Joi.object({
  query: Joi.string().required().min(2).max(100),
  count: Joi.number().integer().min(1).max(15).default(6),
  orientation: Joi.string().valid('landscape', 'portrait', 'squarish').default('landscape')
});

// Upload and process images
router.post('/upload', upload.array('images', 15), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const processedImages = [];

    for (const file of req.files) {
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const filepath = path.join(uploadsDir, filename);

      // Process image with Sharp
      await sharp(file.buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(filepath);

      // Get image metadata
      const metadata = await sharp(file.buffer).metadata();

      processedImages.push({
        id: filename.split('.')[0],
        filename,
        originalName: file.originalname,
        url: `/uploads/${filename}`,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        format: 'webp'
      });
    }

    logger.info(`Processed ${processedImages.length} images`);

    res.json({
      success: true,
      data: processedImages
    });

  } catch (error) {
    logger.error('Image upload error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process images',
      message: error.message
    });
  }
});

// Search Unsplash for stock images
router.post('/search-unsplash', validateRequest(unsplashSearchSchema), async (req, res) => {
  const { query, count, orientation } = req.body;

  try {
    // Since we can't use the actual Unsplash API without a key,
    // we'll return curated stock images from Unsplash
    const stockImages = [
      {
        id: 'unsplash-1',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        alt: 'Premium wireless headphones',
        photographer: 'C D-X',
        downloadUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85'
      },
      {
        id: 'unsplash-2',
        url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
        alt: 'Modern headphones design',
        photographer: 'Blocks Fletcher',
        downloadUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&q=85'
      },
      {
        id: 'unsplash-3',
        url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
        alt: 'Professional audio equipment',
        photographer: 'Malte Wingen',
        downloadUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=85'
      },
      {
        id: 'unsplash-4',
        url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
        alt: 'Wireless technology',
        photographer: 'John Tekeridis',
        downloadUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=85'
      },
      {
        id: 'unsplash-5',
        url: 'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=800&q=80',
        alt: 'Audio device close-up',
        photographer: 'Garrett Morrow',
        downloadUrl: 'https://images.unsplash.com/photo-1558756520-22cfe5d382ca?w=1200&q=85'
      },
      {
        id: 'unsplash-6',
        url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&q=80',
        alt: 'Premium product photography',
        photographer: 'Sennheiser',
        downloadUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=1200&q=85'
      }
    ];

    // Filter and return requested number of images
    const selectedImages = stockImages.slice(0, count).map(img => ({
      ...img,
      query,
      orientation,
      fetchedAt: new Date().toISOString()
    }));

    logger.info(`Found ${selectedImages.length} stock images for query: ${query}`);

    res.json({
      success: true,
      data: selectedImages,
      total: selectedImages.length
    });

  } catch (error) {
    logger.error('Unsplash search error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to search for images',
      message: error.message
    });
  }
});

// Optimize image for different use cases
router.post('/optimize/:imageId', async (req, res) => {
  const { imageId } = req.params;
  const { width, height, quality = 85, format = 'webp' } = req.body;

  try {
    const originalPath = path.join(uploadsDir, `${imageId}.webp`);
    const optimizedFilename = `${imageId}-${width}x${height}-q${quality}.${format}`;
    const optimizedPath = path.join(uploadsDir, optimizedFilename);

    // Check if optimized version already exists
    try {
      await fs.access(optimizedPath);
      return res.json({
        success: true,
        data: {
          url: `/uploads/${optimizedFilename}`,
          width,
          height,
          quality,
          format
        }
      });
    } catch {
      // File doesn't exist, create it
    }

    // Create optimized version
    let sharpInstance = sharp(originalPath);

    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (format === 'webp') {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (format === 'jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality });
    } else if (format === 'png') {
      sharpInstance = sharpInstance.png({ quality });
    }

    await sharpInstance.toFile(optimizedPath);

    res.json({
      success: true,
      data: {
        url: `/uploads/${optimizedFilename}`,
        width,
        height,
        quality,
        format
      }
    });

  } catch (error) {
    logger.error('Image optimization error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to optimize image',
      message: error.message
    });
  }
});

// Delete uploaded image
router.delete('/:imageId', async (req, res) => {
  const { imageId } = req.params;

  try {
    const imagePath = path.join(uploadsDir, `${imageId}.webp`);
    await fs.unlink(imagePath);

    logger.info(`Deleted image: ${imageId}`);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    logger.error('Image deletion error:', error);
    
    res.status(404).json({
      success: false,
      error: 'Image not found or could not be deleted',
      message: error.message
    });
  }
});

export default router;
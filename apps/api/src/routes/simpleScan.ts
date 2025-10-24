import { Router } from 'express';
import multer from 'multer';
import { scanImage, scanBarcode, analyzeText, getScanResult } from '../controllers/simpleScanController';

const router: Router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Scan routes
router.post('/scan-image', upload.single('image'), scanImage);
router.post('/scan-barcode', scanBarcode);
router.post('/analyze-text', analyzeText);
router.get('/scan/:scanId', getScanResult);

export default router;

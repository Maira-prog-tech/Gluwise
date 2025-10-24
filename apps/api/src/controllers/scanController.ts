import { Request, Response } from 'express';
import { z } from 'zod';
import { ApiResponse, ScanResult, AppError } from '../types';
import { VisionService } from '../services/visionService';
import { NutritionService } from '../services/nutritionService';
import { AIService } from '../services/aiService';
import { DatabaseService } from '../services/databaseService';
import { createLogger } from '../utils/logger';

const logger = createLogger();

// Validation schemas
const barcodeSchema = z.object({
  barcode: z.string().min(8).max(14).regex(/^\d+$/, 'Barcode must contain only digits')
});

const textSearchSchema = z.object({
  query: z.string().min(2).max(200),
  brand: z.string().optional()
});

export class ScanController {
  private visionService: VisionService;
  private nutritionService: NutritionService;
  private aiService: AIService;
  private databaseService: DatabaseService;

  constructor() {
    this.visionService = new VisionService();
    this.nutritionService = new NutritionService();
    this.aiService = new AIService();
    this.databaseService = new DatabaseService();
  }

  async scanProduct(req: Request, res: Response): Promise<ApiResponse<ScanResult>> {
    const startTime = Date.now();
    
    try {
      // Check if image was uploaded
      if (!req.file) {
        throw new AppError('No image file provided', 400);
      }

      logger.info({ fileSize: req.file.size, mimeType: req.file.mimetype }, 'Processing image scan');

      // Step 1: Analyze image with Google Vision
      const visionResult = await this.visionService.analyzeImage(req.file.buffer);
      
      // Step 2: Search for product in database or external APIs
      let product = null;
      let nutrition = null;

      // Try barcode first if detected
      if (visionResult.barcode) {
        logger.info({ barcode: visionResult.barcode }, 'Barcode detected, searching...');
        const barcodeResult = await this.nutritionService.searchByBarcode(visionResult.barcode);
        if (barcodeResult) {
          product = barcodeResult.product;
          nutrition = barcodeResult.nutrition;
        }
      }

      // If no barcode result, try text-based search
      if (!product && visionResult.text) {
        logger.info({ text: visionResult.text }, 'Searching by detected text...');
        const textResult = await this.nutritionService.searchByText(visionResult.text);
        if (textResult) {
          product = textResult.product;
          nutrition = textResult.nutrition;
        }
      }

      // If still no result, use AI to extract product info from labels
      if (!product && visionResult.labels && visionResult.labels.length > 0) {
        logger.info({ labels: visionResult.labels }, 'Using AI to identify product from labels...');
        const aiProductInfo = await this.aiService.extractProductInfo(visionResult);
        if (aiProductInfo.productName) {
          const aiResult = await this.nutritionService.searchByText(aiProductInfo.productName);
          if (aiResult) {
            product = aiResult.product;
            nutrition = aiResult.nutrition;
          }
        }
      }

      if (!product || !nutrition) {
        throw new AppError('Could not identify product from image. Please try a clearer photo or enter product name manually.', 404);
      }

      // Step 3: Generate AI analysis
      const userProfile = req.user ? await this.databaseService.getUserProfile(req.user.id) : null;
      const analysis = await this.aiService.analyzeProduct({
        product_name: product.name,
        brand: product.brand,
        nutrition_facts: nutrition,
        user_profile: userProfile,
        language: 'ru'
      });

      // Step 4: Save scan to database
      const scanResult = await this.databaseService.saveScan({
        product,
        nutrition,
        analysis,
        scan_metadata: {
          scan_type: 'image',
          ocr_text: visionResult.text,
          detected_labels: visionResult.labels?.map(l => l.description),
          barcode_detected: visionResult.barcode,
          confidence: visionResult.confidence,
          processing_time_ms: Date.now() - startTime
        },
        user_id: req.user?.id
      });

      logger.info({ 
        scanId: scanResult.id, 
        productName: product.name,
        processingTime: Date.now() - startTime 
      }, 'Scan completed successfully');

      return {
        success: true,
        data: scanResult,
        message: 'Product scanned successfully'
      };

    } catch (error) {
      logger.error({ error: error.message, processingTime: Date.now() - startTime }, 'Scan failed');
      throw error;
    }
  }

  async scanBarcode(req: Request, res: Response): Promise<ApiResponse<ScanResult>> {
    const startTime = Date.now();
    
    try {
      const { barcode } = barcodeSchema.parse(req.body);
      
      logger.info({ barcode }, 'Processing barcode scan');

      // Search by barcode
      const result = await this.nutritionService.searchByBarcode(barcode);
      if (!result) {
        throw new AppError(`Product with barcode ${barcode} not found`, 404);
      }

      // Generate AI analysis
      const userProfile = req.user ? await this.databaseService.getUserProfile(req.user.id) : null;
      const analysis = await this.aiService.analyzeProduct({
        product_name: result.product.name,
        brand: result.product.brand,
        nutrition_facts: result.nutrition,
        user_profile: userProfile,
        language: 'ru'
      });

      // Save scan to database
      const scanResult = await this.databaseService.saveScan({
        product: result.product,
        nutrition: result.nutrition,
        analysis,
        scan_metadata: {
          scan_type: 'barcode',
          barcode_detected: barcode,
          confidence: 1.0,
          processing_time_ms: Date.now() - startTime
        },
        user_id: req.user?.id
      });

      logger.info({ 
        scanId: scanResult.id, 
        barcode,
        productName: result.product.name,
        processingTime: Date.now() - startTime 
      }, 'Barcode scan completed successfully');

      return {
        success: true,
        data: scanResult,
        message: 'Product found by barcode'
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(`Invalid barcode format: ${error.errors[0].message}`, 400);
      }
      logger.error({ error: error.message, processingTime: Date.now() - startTime }, 'Barcode scan failed');
      throw error;
    }
  }

  async searchByText(req: Request, res: Response): Promise<ApiResponse<ScanResult>> {
    const startTime = Date.now();
    
    try {
      const { query, brand } = textSearchSchema.parse(req.body);
      
      logger.info({ query, brand }, 'Processing text search');

      // Search by text
      const searchQuery = brand ? `${brand} ${query}` : query;
      const result = await this.nutritionService.searchByText(searchQuery);
      
      if (!result) {
        throw new AppError(`Product "${query}" not found`, 404);
      }

      // Generate AI analysis
      const userProfile = req.user ? await this.databaseService.getUserProfile(req.user.id) : null;
      const analysis = await this.aiService.analyzeProduct({
        product_name: result.product.name,
        brand: result.product.brand,
        nutrition_facts: result.nutrition,
        user_profile: userProfile,
        language: 'ru'
      });

      // Save scan to database
      const scanResult = await this.databaseService.saveScan({
        product: result.product,
        nutrition: result.nutrition,
        analysis,
        scan_metadata: {
          scan_type: 'manual',
          confidence: result.nutrition.confidence,
          processing_time_ms: Date.now() - startTime
        },
        user_id: req.user?.id
      });

      logger.info({ 
        scanId: scanResult.id, 
        query,
        productName: result.product.name,
        processingTime: Date.now() - startTime 
      }, 'Text search completed successfully');

      return {
        success: true,
        data: scanResult,
        message: 'Product found by search'
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError(`Invalid search parameters: ${error.errors[0].message}`, 400);
      }
      logger.error({ error: error.message, processingTime: Date.now() - startTime }, 'Text search failed');
      throw error;
    }
  }

  async getScanResult(req: Request, res: Response): Promise<ApiResponse<ScanResult>> {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        throw new AppError('Invalid scan ID', 400);
      }

      const scanResult = await this.databaseService.getScanById(id);
      
      if (!scanResult) {
        throw new AppError('Scan result not found', 404);
      }

      // Check if user has access to this scan
      if (req.user && scanResult.user_id && scanResult.user_id !== req.user.id) {
        throw new AppError('Access denied', 403);
      }

      return {
        success: true,
        data: scanResult,
        message: 'Scan result retrieved successfully'
      };

    } catch (error) {
      logger.error({ error: error.message, scanId: req.params.id }, 'Failed to get scan result');
      throw error;
    }
  }
}

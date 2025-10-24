import { Request, Response } from 'express';
import { v4 as generateId } from 'uuid';
import { createLogger } from '../utils/logger';
import { AppError } from '../types';
import { getAIService } from '../services/aiServiceFactory';
import { GeminiVisionService } from '../services/geminiVisionService';

const logger = createLogger();

// Initialize real Gemini Vision service (lazy initialization)
let visionService: GeminiVisionService | null = null;

function getVisionService(): GeminiVisionService {
  if (!visionService) {
    visionService = new GeminiVisionService();
  }
  return visionService;
}


export const scanImage = async (req: Request, res: Response) => {
  try {
    logger.info('Processing image scan request');

    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    // Анализируем изображение с помощью реального Gemini Vision
    const imageBuffer = req.file.buffer;
    const fileName = req.file.originalname || 'unknown';
    const visionServiceInstance = getVisionService();
    const visionResult = await visionServiceInstance.analyzeImage(imageBuffer, fileName);
    
    // Используем результат анализа Gemini Vision
    const detectedProductName = visionResult.detected_product || 'неизвестный продукт';
    
    // Создаем продукт на основе анализа изображения
    const product = {
      id: generateId(),
      name: detectedProductName,
      brand: 'Неизвестно',
      category: visionResult.labels?.[0]?.description || 'Продукт',
      description: visionResult.description || detectedProductName
    };

    // Получаем AI анализ на основе продукта (AI сам определит питание)
    const aiService = getAIService();
    const aiAnalysis = await aiService.analyzeProduct({
      product_name: detectedProductName,
      brand: product.brand,
      nutrition_facts: null,
      language: 'ru'
    });

    // Извлекаем данные о питании из ответа AI (если они есть)
    const nutritionFromAI = aiAnalysis.nutrition || {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 3,
      fiber: 2,
      sugar: 5,
      sodium: 50
    };

    const scanResult = {
      id: generateId(),
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category || 'Food',
        description: `${product.name} от ${product.brand}`
      },
      nutrition: {
        calories: nutritionFromAI.calories,
        protein: nutritionFromAI.protein,
        carbs: nutritionFromAI.carbs,
        fat: nutritionFromAI.fat,
        fiber: nutritionFromAI.fiber || 0,
        sugar: nutritionFromAI.sugar || 0,
        sodium: nutritionFromAI.sodium || 0,
        serving_size: "100г"
      },
      analysis: {
        health_score: aiAnalysis.health_score,
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations,
        benefits: aiAnalysis.benefits,
        warnings: aiAnalysis.warnings.map(w => w.message)
      },
      scan_metadata: {
        scan_type: 'image' as const,
        confidence: visionResult.confidence,
        processing_time_ms: 1500,
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: scanResult,
      message: 'Image scanned successfully'
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Image scan failed');
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

export const scanBarcode = async (req: Request, res: Response) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      throw new AppError('Barcode is required', 400);
    }

    logger.info({ barcode }, 'Processing barcode scan');

    // Создаем продукт напрямую из штрих-кода
    const product = {
      id: generateId(),
      name: `Продукт ${barcode}`,
      brand: 'Неизвестно',
      barcode: barcode,
      category: 'Продукт',
      description: `Продукт со штрих-кодом ${barcode}`
    };

    // Получаем AI анализ на основе продукта (AI сам определит питание)
    const aiService = getAIService();
    const aiAnalysis = await aiService.analyzeProduct({
      product_name: product.name,
      brand: product.brand,
      nutrition_facts: null,
      language: 'ru'
    });

    // Извлекаем данные о питании из ответа AI (если они есть)
    const nutritionFromAI = aiAnalysis.nutrition || {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 3,
      fiber: 2,
      sugar: 5,
      sodium: 50
    };

    const scanResult = {
      id: generateId(),
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        category: product.category || 'Food',
        description: `${product.name} от ${product.brand}`
      },
      nutrition: {
        calories: nutritionFromAI.calories,
        protein: nutritionFromAI.protein,
        carbs: nutritionFromAI.carbs,
        fat: nutritionFromAI.fat,
        fiber: nutritionFromAI.fiber || 0,
        sugar: nutritionFromAI.sugar || 0,
        sodium: nutritionFromAI.sodium || 0,
        serving_size: "100г"
      },
      analysis: {
        health_score: aiAnalysis.health_score,
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations,
        benefits: aiAnalysis.benefits,
        warnings: aiAnalysis.warnings.map(w => w.message)
      },
      scan_metadata: {
        scan_type: 'barcode' as const,
        confidence: aiAnalysis.confidence,
        processing_time_ms: 800,
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: scanResult,
      message: 'Barcode scanned successfully'
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Barcode scan failed');
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

export const analyzeText = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      throw new AppError('Search query is required', 400);
    }

    logger.info({ query }, 'Processing text analysis');

    // Создаем продукт напрямую из запроса пользователя
    const product = {
      id: generateId(),
      name: query,
      brand: 'Неизвестно',
      category: 'Продукт',
      description: query
    };

    // Получаем ПОЛНЫЙ AI анализ, включая данные о питании
    const aiService = getAIService();
    
    // Используем обычный анализ без специального промпта
    const analysisRequest = {
      product_name: query,
      brand: product.brand,
      nutrition_facts: null,
      language: 'ru' as const
    };

    const aiAnalysis = await aiService.analyzeProduct(analysisRequest);

    // Извлекаем данные о питании из ответа AI (если они есть)
    const nutritionFromAI = aiAnalysis.nutrition || {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 3,
      fiber: 2,
      sugar: 5,
      sodium: 50
    };

    const scanResult = {
      id: generateId(),
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category || 'Food',
        description: `${product.name} от ${product.brand}`
      },
      nutrition: {
        calories: nutritionFromAI.calories,
        protein: nutritionFromAI.protein,
        carbs: nutritionFromAI.carbs,
        fat: nutritionFromAI.fat,
        fiber: nutritionFromAI.fiber || 0,
        sugar: nutritionFromAI.sugar || 0,
        sodium: nutritionFromAI.sodium || 0,
        serving_size: "100г"
      },
      analysis: {
        health_score: aiAnalysis.health_score,
        insights: aiAnalysis.insights,
        recommendations: aiAnalysis.recommendations,
        benefits: aiAnalysis.benefits,
        warnings: aiAnalysis.warnings.map(w => w.message)
      },
      scan_metadata: {
        scan_type: 'manual' as const,
        confidence: aiAnalysis.confidence,
        processing_time_ms: 1200,
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: scanResult,
      message: 'Text analyzed successfully'
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Text analysis failed');
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

export const getScanResult = async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;

    logger.info({ scanId }, 'Getting scan result');

    // Mock scan result
    const scanResult = {
      id: scanId,
      product: {
        id: generateId(),
        name: 'Cached Product',
        brand: 'Test Brand',
        categories: ['Food'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      nutrition: {
        id: generateId(),
        product_id: generateId(),
        portion_grams: 100,
        calories: 220,
        protein: 7,
        carbs: 28,
        fat: 9,
        source: 'manual',
        confidence: 0.8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      analysis: {
        id: generateId(),
        product_id: generateId(),
        language: 'ru',
        warnings: [],
        insights: 'Сохраненный результат сканирования',
        recommendations: ['Данные из кэша'],
        allergen_alerts: [],
        health_score: 7,
        confidence: 0.8,
        model_version: '1.0',
        created_at: new Date().toISOString()
      },
      scan_metadata: {
        scan_type: 'image',
        confidence: 0.8,
        processing_time_ms: 100
      }
    };

    res.json({
      success: true,
      data: scanResult
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to get scan result');
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

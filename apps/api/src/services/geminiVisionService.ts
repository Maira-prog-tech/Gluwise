import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../utils/logger';
import type { VisionResult } from '../types';

const logger = createLogger();

export class GeminiVisionService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required for vision analysis');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Используем современную модель, которая поддерживает изображения
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeImage(imageBuffer: Buffer, fileName?: string): Promise<VisionResult> {
    try {
      logger.info('Starting REAL Gemini Vision image analysis');

      // Конвертируем изображение в base64
      const imageBase64 = imageBuffer.toString('base64');
      const mimeType = this.detectMimeType(imageBuffer);

      logger.info({ mimeType, size: imageBuffer.length }, 'Image prepared for Gemini Vision');

      // Запрос к Gemini Vision для определения продукта
      const prompt = `
Внимательно изучи это изображение и определи, какой именно продукт питания на нем показан.

ВАЖНО: Игнорируй название файла! Анализируй только то, что видишь на изображении!

Посмотри на:
- Форму, цвет, текстуру продукта
- Размер и внешний вид
- Характерные особенности

Ответь СТРОГО в формате JSON:
{
  "product_name": "точное название продукта на русском языке",
  "category": "категория продукта (Фрукты, Овощи, Мясо, Рыба, Молочные продукты, Злаки, Орехи)",
  "confidence": число_от_0_до_1,
  "description": "подробное описание того что видно на изображении"
}

Примеры хороших ответов:
- Авокадо: {"product_name": "авокадо", "category": "Фрукты", "confidence": 0.9, "description": "зеленый овальный плод с темной кожурой"}
- Банан: {"product_name": "банан", "category": "Фрукты", "confidence": 0.95, "description": "желтый изогнутый фрукт"}

Отвечай только JSON, без дополнительного текста!
`;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      logger.info({ responseLength: text.length, rawResponse: text.substring(0, 200) }, 'Gemini Vision response received');

      // Парсим JSON ответ
      let analysisResult;
      try {
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        logger.info({ cleanText }, 'Attempting to parse Gemini Vision JSON');
        analysisResult = JSON.parse(cleanText);
        
        // Проверяем, что получили валидный результат
        if (!analysisResult.product_name || analysisResult.product_name === 'неизвестный продукт') {
          throw new Error('Gemini Vision не смог определить продукт');
        }
        
        logger.info({ 
          detectedProduct: analysisResult.product_name,
          confidence: analysisResult.confidence,
          method: 'real_gemini_vision'
        }, 'SUCCESS: Gemini Vision successfully identified product');
        
      } catch (parseError) {
        logger.error({ 
          text: text.substring(0, 500), 
          parseError: parseError.message 
        }, 'FAILED: Gemini Vision failed to identify product, using filename fallback');
        
        // Fallback: используем анализ имени файла
        const fallbackProduct = this.extractProductFromFilename(fileName || 'unknown');
        analysisResult = {
          product_name: fallbackProduct,
          category: this.categorizeProduct(fallbackProduct),
          confidence: 0.4,
          description: `Не удалось распознать изображение. Определено по имени файла: ${fallbackProduct}`
        };
      }

      // Формируем результат в нужном формате
      const visionResult: VisionResult = {
        text: `Detected: ${analysisResult.product_name}`,
        labels: [
          { description: analysisResult.category, score: analysisResult.confidence },
          { description: 'Продукт питания', score: 0.9 },
          { description: analysisResult.product_name, score: analysisResult.confidence }
        ],
        confidence: analysisResult.confidence,
        detected_product: analysisResult.product_name,
        description: analysisResult.description
      };

      logger.info({ 
        detectedProduct: analysisResult.product_name,
        confidence: analysisResult.confidence,
        method: 'gemini_vision'
      }, 'Gemini Vision analysis completed');

      return visionResult;

    } catch (error: any) {
      logger.error({ error: error.message }, 'Gemini Vision analysis failed, falling back to filename');
      
      // Fallback к анализу имени файла
      const productName = this.extractProductFromFilename(fileName || 'unknown');
      
      return {
        text: `Detected from filename: ${productName}`,
        labels: [
          { description: this.categorizeProduct(productName), score: 0.6 },
          { description: 'Продукт питания', score: 0.9 },
          { description: productName, score: 0.6 }
        ],
        confidence: 0.6,
        detected_product: productName,
        description: `Продукт определен по имени файла: ${productName} (Vision API недоступен)`
      };
    }
  }

  private extractProductFromFilename(fileName: string): string {
    // Убираем расширение файла
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Убираем числа и специальные символы
    const cleanName = nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\d+/g, '')
      .replace(/[^\w\sа-яё]/gi, '')
      .trim();
    
    // Словарь для перевода английских названий на русский
    const translations: { [key: string]: string } = {
      'salmon': 'лосось',
      'fish': 'рыба',
      'avocado': 'авокадо',
      'apple': 'яблоко',
      'banana': 'банан',
      'chicken': 'курица',
      'beef': 'говядина',
      'pork': 'свинина',
      'rice': 'рис',
      'bread': 'хлеб',
      'milk': 'молоко',
      'cheese': 'сыр',
      'yogurt': 'йогурт',
      'egg': 'яйцо',
      'tomato': 'помидор',
      'potato': 'картофель',
      'carrot': 'морковь',
      'onion': 'лук',
      'garlic': 'чеснок',
      'food': 'продукт'
    };
    
    // Ищем совпадения в словаре
    const lowerName = cleanName.toLowerCase();
    for (const [eng, rus] of Object.entries(translations)) {
      if (lowerName.includes(eng)) {
        return rus;
      }
    }
    
    // Если не нашли перевод, возвращаем очищенное имя или дефолт
    return cleanName || 'неизвестный продукт';
  }

  private categorizeProduct(productName: string): string {
    const categories: { [key: string]: string[] } = {
      'Рыба и морепродукты': ['лосось', 'рыба', 'тунец', 'креветки', 'краб'],
      'Фрукты': ['авокадо', 'яблоко', 'банан', 'апельсин', 'груша'],
      'Мясо': ['курица', 'говядина', 'свинина', 'баранина'],
      'Молочные продукты': ['молоко', 'сыр', 'йогурт', 'творог', 'кефир'],
      'Овощи': ['помидор', 'картофель', 'морковь', 'лук', 'чеснок'],
      'Злаки': ['рис', 'хлеб', 'овсянка', 'гречка']
    };
    
    const lowerProduct = productName.toLowerCase();
    for (const [category, products] of Object.entries(categories)) {
      if (products.some(product => lowerProduct.includes(product))) {
        return category;
      }
    }
    
    return 'Продукт';
  }

  private detectMimeType(buffer: Buffer): string {
    // Простое определение MIME типа по заголовку файла
    const header = buffer.toString('hex', 0, 4).toUpperCase();
    
    if (header.startsWith('FFD8')) return 'image/jpeg';
    if (header.startsWith('8950')) return 'image/png';
    if (header.startsWith('4749')) return 'image/gif';
    if (header.startsWith('424D')) return 'image/bmp';
    if (header.startsWith('5249')) return 'image/webp';
    
    // По умолчанию JPEG
    return 'image/jpeg';
  }
}

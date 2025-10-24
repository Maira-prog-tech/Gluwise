import { GoogleGenerativeAI } from '@google/generative-ai';
import { createLogger } from '../utils/logger';
import type { GeminiAnalysisRequest, GeminiAnalysisResponse } from '../types';

const logger = createLogger();

export class RealGeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeProduct(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      logger.info({ 
        productName: request.product_name 
      }, 'Starting REAL Gemini analysis - AI will determine everything');

      // Просим Gemini сам определить продукт и его реальные данные о питании
      const prompt = `
Ты эксперт по питанию. Проанализируй продукт "${request.product_name}" и верни ПОЛНЫЙ анализ на русском языке.

ВАЖНО: Определи сам реальные данные о питании на 100г из своих знаний о продуктах.

Ответь СТРОГО в формате JSON:
{
  "nutrition": {
    "calories": реальные_калории_на_100г,
    "protein": граммы_белка,
    "carbs": граммы_углеводов,
    "fat": граммы_жиров,
    "fiber": граммы_клетчатки,
    "sugar": граммы_сахара,
    "sodium": миллиграммы_натрия
  },
  "insights": "Подробный анализ продукта с реальными данными о питании (3-4 предложения)",
  "recommendations": ["Практическая рекомендация 1", "Практическая рекомендация 2", "Практическая рекомендация 3"],
  "benefits": ["Польза 1", "Польза 2", "Польза 3"],
  "allergen_alerts": [],
  "warnings": [
    {
      "type": "тип_предупреждения",
      "severity": "low/medium/high", 
      "message": "Краткое предупреждение",
      "details": "Подробности предупреждения"
    }
  ],
  "health_score": число_от_1_до_10,
  "confidence": число_от_0_до_1
}

Примеры типов предупреждений: "high_calories", "high_sugar", "high_sodium", "allergen", "low_nutrition", "general"

Отвечай только JSON, без дополнительного текста.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      logger.info({ responseLength: text.length }, 'Real Gemini response received');

      // Парсим JSON ответ
      let analysisResult;
      try {
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysisResult = JSON.parse(cleanText);
        
        logger.info({ 
          healthScore: analysisResult.health_score,
          warningsCount: analysisResult.warnings?.length || 0 
        }, 'Real Gemini analysis completed successfully');

        return analysisResult;
        
      } catch (parseError) {
        logger.warn({ text }, 'Failed to parse Gemini JSON, extracting insights');
        
        // Fallback: извлекаем основную информацию из текста
        return {
          insights: text.substring(0, 300) + '...',
          recommendations: ['Проконсультируйтесь с диетологом для персональных рекомендаций'],
          benefits: ['Содержит полезные питательные вещества'],
          allergen_alerts: [],
          warnings: [{
            type: 'general',
            severity: 'low' as const,
            message: 'Общие рекомендации по употреблению',
            details: 'Соблюдайте умеренность в употреблении'
          }],
          health_score: 6,
          confidence: 0.7
        };
      }

    } catch (error: any) {
      logger.error({ error: error.message }, 'Real Gemini analysis failed');
      
      // Возвращаем базовый анализ при ошибке
      return {
        insights: `Не удалось получить детальный анализ продукта "${request.product_name}" от AI. Рекомендуется проконсультироваться с диетологом.`,
        recommendations: ['Употребляйте в умеренных количествах', 'Следите за общим балансом рациона'],
        benefits: ['Может содержать полезные питательные вещества'],
        allergen_alerts: [],
        warnings: [{
          type: 'general',
          severity: 'medium' as const,
          message: 'Анализ недоступен',
          details: 'Не удалось получить данные от AI сервиса'
        }],
        health_score: 5,
        confidence: 0.3
      };
    }
  }
}

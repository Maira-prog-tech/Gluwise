import { RealGeminiService } from './realGeminiService';
import { createLogger } from '../utils/logger';

const logger = createLogger();

export class AIServiceFactory {
  private static instance: RealGeminiService | null = null;

  static getInstance(): RealGeminiService {
    if (!this.instance) {
      this.instance = this.createService();
    }
    return this.instance;
  }

  private static createService(): RealGeminiService {
    logger.info('Initializing Real Gemini AI service');

    try {
      return new RealGeminiService();
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to initialize Gemini service');
      throw new Error(`AI service initialization failed: ${error.message}`);
    }
  }

  // Метод для получения статуса AI
  static getStatus(): { provider: string; status: string } {
    try {
      const service = this.getInstance();
      return { provider: 'gemini', status: 'ready' };
    } catch (error: any) {
      return { provider: 'gemini', status: `error: ${error.message}` };
    }
  }
}

// Экспортируем удобную функцию для получения сервиса
export const getAIService = (): RealGeminiService => {
  return AIServiceFactory.getInstance();
};

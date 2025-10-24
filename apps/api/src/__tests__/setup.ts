// Jest setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

// Mock Gemini AI for testing
jest.mock('../services/realGeminiService', () => ({
  RealGeminiService: jest.fn().mockImplementation(() => ({
    analyzeProduct: jest.fn().mockResolvedValue({
      insights: 'Test product analysis',
      recommendations: ['Test recommendation'],
      benefits: ['Test benefit'],
      allergen_alerts: [],
      warnings: [],
      health_score: 8,
      confidence: 0.9,
      nutrition: {
        calories: 100,
        protein: 5,
        carbs: 10,
        fat: 3,
        fiber: 2,
        sugar: 5,
        sodium: 50
      }
    })
  }))
}));

// Global test timeout
jest.setTimeout(10000);

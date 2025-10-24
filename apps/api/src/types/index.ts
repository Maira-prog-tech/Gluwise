// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  image_url?: string;
  categories: string[];
  created_at: string;
  updated_at: string;
}

// Nutrition Types
export interface NutritionFacts {
  id: string;
  product_id: string;
  portion_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  sugar?: number;
  fat: number;
  saturated_fat?: number;
  fiber?: number;
  sodium?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  source: 'usda' | 'edamam' | 'manual';
  confidence: number;
  created_at: string;
  updated_at: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  user_id: string;
  goals: 'lose_weight' | 'gain_weight' | 'maintain' | 'build_muscle';
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  allergens: string[];
  dietary_restrictions: string[];
  daily_calorie_target?: number;
  daily_protein_target?: number;
  daily_carbs_target?: number;
  daily_fat_target?: number;
  created_at: string;
  updated_at: string;
}

// Scan Types
export interface ScanRequest {
  image?: Express.Multer.File;
  barcode?: string;
  manual_query?: string;
}

export interface ScanResult {
  id: string;
  product: Product;
  nutrition: NutritionFacts;
  analysis: AIAnalysis;
  scan_metadata: ScanMetadata;
}

export interface ScanMetadata {
  scan_type: 'image' | 'barcode' | 'manual';
  ocr_text?: string;
  detected_labels?: string[];
  barcode_detected?: string;
  confidence: number;
  processing_time_ms: number;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  product_id: string;
  user_id?: string;
  language: 'ru' | 'en';
  warnings: AIWarning[];
  insights: string;
  recommendations: string[];
  benefits: string[];
  allergen_alerts: string[];
  health_score: number; // 1-10
  confidence: number;
  model_version: string;
  created_at: string;
}

export interface AIWarning {
  type: 'allergen' | 'high_sugar' | 'high_sodium' | 'high_calories' | 'low_nutrition' | 'general';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details?: string;
}

// Vision API Types
export interface VisionResult {
  text?: string;
  labels?: Array<{
    description: string;
    score: number;
  }>;
  barcode?: string;
  confidence: number;
  detected_product?: string;
  description?: string;
}

// USDA API Types
export interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  gtinUpc?: string;
  ingredients?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

// Gemini AI Types
export interface GeminiAnalysisRequest {
  product_name: string;
  brand?: string;
  nutrition_facts?: NutritionFacts | null;
  language: 'ru' | 'en';
}

export interface GeminiAnalysisResponse {
  warnings: AIWarning[];
  insights: string;
  recommendations: string[];
  benefits: string[];
  allergen_alerts: string[];
  health_score: number;
  confidence: number;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

// Database Types
export interface DatabaseConfig {
  url: string;
  apiKey: string;
  serviceRoleKey: string;
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

// Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
  };
}

// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

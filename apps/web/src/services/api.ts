import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://gluwise-81bgzsd46-maira-prog-techs-projects.vercel.app/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode?: string;
  category: string;
  description: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  serving_size: string;
}

export interface AIAnalysis {
  health_score: number;
  insights: string;
  recommendations: string[];
  warnings: string[];
  benefits: string[];
}

export interface ScanMetadata {
  scan_type: 'barcode' | 'image' | 'manual';
  confidence: number;
  processing_time_ms: number;
  timestamp: string;
}

export interface ScanResult {
  id: string;
  product: Product;
  nutrition: NutritionInfo;
  analysis: AIAnalysis;
  scan_metadata: ScanMetadata;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: string;
    gemini: string;
    vision: string;
    usda: string;
  };
  uptime?: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

class ApiService {
  // Health check
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await apiClient.get('/health');
      return response.data.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Scan barcode
  async scanBarcode(barcode: string): Promise<ScanResult> {
    try {
      const response = await apiClient.post('/scan-barcode', { barcode });
      return response.data.data;
    } catch (error) {
      console.error('Barcode scan failed:', error);
      throw error;
    }
  }

  // Scan image
  async scanImage(imageFile: File): Promise<ScanResult> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiClient.post('/scan-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Image scan failed:', error);
      throw error;
    }
  }

  // Analyze text
  async analyzeText(query: string): Promise<ScanResult> {
    try {
      const response = await apiClient.post('/analyze-text', { query });
      return response.data.data;
    } catch (error) {
      console.error('Text analysis failed:', error);
      throw error;
    }
  }

  // Get scan result by ID
  async getScanResult(scanId: string): Promise<ScanResult> {
    try {
      const response = await apiClient.get(`/scan/${scanId}`);
      return response.data.data;
    } catch (error) {
      console.error('Get scan result failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;

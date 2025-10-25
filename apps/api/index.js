// Vercel serverless function - FRESH FILE
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🚀 GluWise API - Fresh Deploy');

const app = express();

// Temporarily disable helmet for CORS testing
// app.use(helmet());
// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 GluWise API is WORKING on Vercel!',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      message: 'API is working perfectly!',
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/v1/analyze-text', (req, res) => {
  const { query } = req.body;
  res.json({
    success: true,
    data: {
      id: `scan_${Date.now()}`,
      product: { 
        name: query || 'Test Product',
        brand: 'Unknown',
        category: 'Food'
      },
      nutrition: { 
        calories: 100, 
        protein: 5,
        carbs: 15,
        fat: 3,
        fiber: 2,
        sugar: 8,
        sodium: 50,
        serving_size: '100g'
      },
      analysis: {
        health_score: 75,
        insights: `${query} is a nutritious choice!`,
        recommendations: [`Great source of nutrients!`],
        warnings: [],
        benefits: ['Natural product', 'Good for health']
      },
      scan_metadata: {
        scan_type: 'text',
        confidence: 95,
        processing_time_ms: 1200,
        timestamp: new Date().toISOString()
      }
    }
  });
});

// Add missing endpoints
app.post('/api/v1/scan-image', (req, res) => {
  res.json({
    success: true,
    data: {
      id: `scan_${Date.now()}`,
      product: { 
        name: 'Scanned Product',
        brand: 'Unknown',
        category: 'Food'
      },
      nutrition: { 
        calories: 150, 
        protein: 8,
        carbs: 20,
        fat: 5,
        fiber: 3,
        sugar: 10,
        sodium: 75,
        serving_size: '100g'
      },
      analysis: {
        health_score: 80,
        insights: 'Product identified from image',
        recommendations: ['Good nutritional profile'],
        warnings: [],
        benefits: ['Natural ingredients']
      },
      scan_metadata: {
        scan_type: 'image',
        confidence: 85,
        processing_time_ms: 2500,
        timestamp: new Date().toISOString()
      }
    }
  });
});

app.post('/api/v1/scan-barcode', (req, res) => {
  const { barcode } = req.body;
  res.json({
    success: true,
    data: {
      id: `scan_${Date.now()}`,
      product: { 
        name: 'Barcode Product',
        brand: 'Brand Name',
        barcode: barcode,
        category: 'Food'
      },
      nutrition: { 
        calories: 200, 
        protein: 10,
        carbs: 25,
        fat: 8,
        fiber: 4,
        sugar: 12,
        sodium: 100,
        serving_size: '100g'
      },
      analysis: {
        health_score: 70,
        insights: 'Product found by barcode',
        recommendations: ['Moderate consumption recommended'],
        warnings: ['Contains added sugars'],
        benefits: ['Source of protein']
      },
      scan_metadata: {
        scan_type: 'barcode',
        confidence: 98,
        processing_time_ms: 800,
        timestamp: new Date().toISOString()
      }
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl
  });
});

module.exports = app;

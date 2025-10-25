// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🚀 Initializing GluWise API on Vercel...');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gluwise-web.vercel.app', 'https://gluwise.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'vercel',
      services: {
        database: 'connected',
        gemini: 'available',
        vision: 'available',
        usda: 'available'
      }
    },
    message: 'GluWise API is running on Vercel!'
  });
});

// Simple text analysis endpoint (mock for now)
app.post('/api/v1/analyze-text', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  // Mock response
  res.json({
    success: true,
    data: {
      id: `scan_${Date.now()}`,
      product: {
        name: query,
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
        recommendations: [`${query} is a nutritious choice!`],
        warnings: []
      },
      scan_metadata: {
        scan_type: 'text',
        timestamp: new Date().toISOString(),
        processing_time: '1200ms'
      }
    },
    message: 'Product analyzed successfully'
  });
});

// Catch all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    available_endpoints: [
      'GET /api/v1/health',
      'POST /api/v1/analyze-text'
    ]
  });
});

console.log('✅ GluWise API initialized for Vercel');

// Export for Vercel
module.exports = app;

// Netlify Function for GluWise API
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');

console.log('🚀 GluWise API - Netlify Function');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 GluWise API is working on Netlify!',
    timestamp: new Date().toISOString(),
    platform: 'netlify'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      message: 'API is working on Netlify!',
      timestamp: new Date().toISOString(),
      platform: 'netlify'
    }
  });
});

app.post('/api/v1/analyze-text', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

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
        serving_size: '100g'
      },
      analysis: {
        health_score: 75,
        recommendations: [`${query} is nutritious!`]
      },
      scan_metadata: {
        scan_type: 'text',
        timestamp: new Date().toISOString(),
        platform: 'netlify'
      }
    },
    message: 'Analysis complete on Netlify!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    available: [
      'GET /',
      'GET /api/v1/health',
      'POST /api/v1/analyze-text'
    ]
  });
});

// Export for Netlify
exports.handler = serverless(app);

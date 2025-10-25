// Vercel serverless function - FRESH FILE
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🚀 GluWise API - Fresh Deploy');

const app = express();

app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));
app.use(express.json());

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
      product: { name: query || 'Test Product' },
      nutrition: { calories: 100, protein: 5 },
      message: 'Analysis complete!'
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

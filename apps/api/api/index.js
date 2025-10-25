// Vercel serverless function entry point
const express = require('express');
const path = require('path');

// Import the compiled server
let app;

try {
  // Try to load the compiled simple server
  const simpleServerPath = path.join(__dirname, '..', 'dist', 'simpleIndex.js');
  console.log('Loading server from:', simpleServerPath);
  
  // For Vercel, we need to export the Express app, not start a server
  if (require('fs').existsSync(simpleServerPath)) {
    delete require.cache[require.resolve(simpleServerPath)];
    app = require(simpleServerPath).default || require(simpleServerPath);
  } else {
    // Fallback: create a simple Express app
    app = express();
    app.get('/api/v1/health', (req, res) => {
      res.json({
        success: true,
        message: 'GluWise API is running on Vercel!',
        timestamp: new Date().toISOString()
      });
    });
  }
} catch (error) {
  console.error('Error loading server:', error);
  
  // Create fallback app
  app = express();
  app.get('*', (req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message
    });
  });
}

// Export for Vercel
module.exports = app;

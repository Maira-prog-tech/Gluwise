// Production entry point for Railway/Render deployment
// This file ensures the server starts correctly in production

console.log('🚀 Starting GluWise API Server...');
console.log('📂 Current directory:', __dirname);
console.log('📁 Looking for compiled files...');
console.log('🤖 Using Gemini AI services');

try {
  // Check if dist/index.js exists
  const fs = require('fs');
  const path = require('path');
  const distPath = path.join(__dirname, 'dist', 'index.js');
  
  const simpleDistPath = path.join(__dirname, 'dist', 'simpleIndex.js');
  
  if (fs.existsSync(simpleDistPath)) {
    console.log('✅ Found dist/simpleIndex.js, starting server...');
    require('./dist/simpleIndex.js');
  } else if (fs.existsSync(distPath)) {
    console.log('✅ Found dist/index.js, starting server...');
    require('./dist/index.js');
  } else {
    console.log('❌ No compiled files found, trying start.js...');
    require('./start.js');
  }
} catch (error) {
  console.error('💥 Error starting server:', error.message);
  process.exit(1);
}

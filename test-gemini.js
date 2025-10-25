const { GoogleGenerativeAI } = require('@google/generative-ai');

process.env.GEMINI_API_KEY = 'AIzaSyDy9s47gImZBI-CI3mgrSgiZCV0XLrSke8';

async function testGemini() {
  try {
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('Testing Gemini...');
    const result = await model.generateContent('Привет! Как дела?');
    const response = await result.response;
    const text = response.text();
    
    console.log('Success:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini();

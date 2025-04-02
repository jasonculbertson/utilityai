// Simple test script for OCR processing
require('dotenv').config({ path: './.env.test' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Test configuration
const testPdfPath = './test-files/extracted_pages/page_1.pdf'; // Using a single page for testing
const ocrApiKey = process.env.OCR_SPACE_API_KEY;

// Function to test OCR API directly
async function testOcrApi() {
  console.log('\n===== TESTING OCR API DIRECTLY =====');
  console.log(`Using OCR API key: ${ocrApiKey}`);
  console.log(`Testing with PDF: ${testPdfPath}`);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(testPdfPath)) {
      console.error(`File not found: ${testPdfPath}`);
      return;
    }
    
    // Create form data for OCR API request
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testPdfPath));
    
    console.log('Sending request to OCR.space API...');
    
    // Send request to OCR API
    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'apikey': ocrApiKey,
      },
      params: {
        'language': 'eng',
        'isOverlayRequired': 'false',
        'scale': 'true',
        'isTable': 'true',
        'OCREngine': '2',
      },
      timeout: 60000 // 60 second timeout
    });
    
    console.log(`OCR API response status: ${response.status}`);
    
    if (response.data) {
      if (response.data.IsErroredOnProcessing) {
        console.error('OCR API returned an error:');
        console.error(`Error message: ${response.data.ErrorMessage}`);
        console.error(`Error details: ${response.data.ErrorDetails}`);
      } else {
        console.log('OCR processing successful');
        if (response.data.ParsedResults && response.data.ParsedResults.length > 0) {
          const extractedText = response.data.ParsedResults.map(result => result.ParsedText).join('\n');
          console.log(`Extracted ${extractedText.length} characters of text`);
          console.log('Text preview:', extractedText.substring(0, 200) + '...');
        } else {
          console.warn('No parsed results found in OCR response');
        }
      }
    }
    
    console.log('\n===== OCR TEST COMPLETED =====');
  } catch (error) {
    console.error('\n===== OCR TEST FAILED =====');
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testOcrApi();
